import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { db, seedSampleData } from './server/db.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Lightweight health endpoint used by the DBMS interface to prove that the
// Express API, SQLite file, and foreign-key enforcement are all live.
app.get('/api/health', (_req: Request, res: Response) => {
  try {
    const foreignKeys = db.pragma('foreign_keys', { simple: true });
    const tables = (db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as Array<{ name: string }>).map((table) => table.name);
    const counts = {
      teams: (db.prepare('SELECT COUNT(*) AS count FROM Team').get() as { count: number }).count,
      players: (db.prepare('SELECT COUNT(*) AS count FROM Player').get() as { count: number }).count,
      matches: (db.prepare('SELECT COUNT(*) AS count FROM Match').get() as { count: number }).count,
    };
    res.json({ ok: true, engine: 'SQLite', foreignKeys: foreignKeys === 1, tables, counts });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==========================================
// 1. DASHBOARD & AGGREGATE STATISTICS (DQL)
// ==========================================
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const totalTeams = (db.prepare('SELECT COUNT(*) as count FROM Team').get() as { count: number }).count;
    const totalPlayers = (db.prepare('SELECT COUNT(*) as count FROM Player').get() as { count: number }).count;
    const totalMatches = (db.prepare('SELECT COUNT(*) as count FROM Match').get() as { count: number }).count;
    const completedMatches = (db.prepare("SELECT COUNT(*) as count FROM Match WHERE status = 'Completed'").get() as { count: number }).count;

    const runsWickets = db.prepare(`
      SELECT 
        COALESCE(SUM(runs), 0) as totalRuns,
        COALESCE(SUM(wickets), 0) as totalWickets
      FROM Score
    `).get() as { totalRuns: number; totalWickets: number };

    // Top 5 Run Scorers across tournament (Aggregate SUM with INNER JOIN & GROUP BY)
    const topScorers = db.prepare(`
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        t.team_name,
        COALESCE(SUM(pf.runs_scored), 0) AS total_runs,
        COALESCE(SUM(pf.balls_faced), 0) AS total_balls,
        COUNT(pf.match_id) AS innings_played
      FROM Player p
      INNER JOIN Team t ON p.team_id = t.team_id
      INNER JOIN Performance pf ON p.player_id = pf.player_id
      GROUP BY p.player_id, p.player_name, p.role, t.team_name
      ORDER BY total_runs DESC
      LIMIT 5
    `).all();

    // Top 5 Wicket Takers across tournament
    const topBowlers = db.prepare(`
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        t.team_name,
        COALESCE(SUM(pf.wickets_taken), 0) AS total_wickets,
        COALESCE(SUM(pf.overs_bowled), 0) AS total_overs,
        COUNT(pf.match_id) AS matches_played
      FROM Player p
      INNER JOIN Team t ON p.team_id = t.team_id
      INNER JOIN Performance pf ON p.player_id = pf.player_id
      WHERE pf.wickets_taken > 0 OR pf.overs_bowled > 0
      GROUP BY p.player_id, p.player_name, p.role, t.team_name
      ORDER BY total_wickets DESC
      LIMIT 5
    `).all();

    // Recent Matches with scores
    const recentMatches = db.prepare(`
      SELECT 
        m.match_id,
        m.match_date,
        m.venue,
        m.status,
        t1.team_id AS team1_id,
        t1.team_name AS team1_name,
        t1.country AS team1_country,
        t2.team_id AS team2_id,
        t2.team_name AS team2_name,
        t2.country AS team2_country,
        s1.runs AS team1_runs,
        s1.wickets AS team1_wickets,
        s1.overs AS team1_overs,
        s2.runs AS team2_runs,
        s2.wickets AS team2_wickets,
        s2.overs AS team2_overs
      FROM Match m
      INNER JOIN Team t1 ON m.team1_id = t1.team_id
      INNER JOIN Team t2 ON m.team2_id = t2.team_id
      LEFT JOIN Score s1 ON m.match_id = s1.match_id AND m.team1_id = s1.team_id
      LEFT JOIN Score s2 ON m.match_id = s2.match_id AND m.team2_id = s2.team_id
      ORDER BY m.match_date DESC
      LIMIT 6
    `).all();

    res.json({
      totalTeams,
      totalPlayers,
      totalMatches,
      completedMatches,
      totalRuns: runsWickets.totalRuns,
      totalWickets: runsWickets.totalWickets,
      topScorers,
      topBowlers,
      recentMatches,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. TEAMS API (CRUD)
// ==========================================
app.get('/api/teams', (_req: Request, res: Response) => {
  try {
    const teams = db.prepare(`
      SELECT 
        t.team_id,
        t.team_name,
        t.country,
        t.created_at,
        COUNT(p.player_id) AS player_count
      FROM Team t
      LEFT JOIN Player p ON t.team_id = p.team_id
      GROUP BY t.team_id, t.team_name, t.country, t.created_at
      ORDER BY t.team_name ASC
    `).all();
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', (req: Request, res: Response) => {
  const { team_name, country } = req.body;
  if (!team_name || !country) {
    return res.status(400).json({ error: 'Team name and country are required.' });
  }
  try {
    const stmt = db.prepare('INSERT INTO Team (team_name, country) VALUES (?, ?)');
    const result = stmt.run(team_name.trim(), country.trim());
    res.status(201).json({ team_id: Number(result.lastInsertRowid), team_name, country });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: `Team "${team_name}" already exists.` });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/teams/:id', (req: Request, res: Response) => {
  const team_id = parseInt(req.params.id, 10);
  const { team_name, country } = req.body;
  if (!team_name || !country) {
    return res.status(400).json({ error: 'Team name and country are required.' });
  }
  try {
    const stmt = db.prepare('UPDATE Team SET team_name = ?, country = ? WHERE team_id = ?');
    const result = stmt.run(team_name.trim(), country.trim(), team_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    res.json({ team_id, team_name, country });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teams/:id', (req: Request, res: Response) => {
  const team_id = parseInt(req.params.id, 10);
  try {
    const stmt = db.prepare('DELETE FROM Team WHERE team_id = ?');
    const result = stmt.run(team_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Team not found.' });
    }
    res.json({ message: 'Team and associated players/records deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. PLAYERS API (CRUD)
// ==========================================
app.get('/api/players', (req: Request, res: Response) => {
  try {
    const { team_id, role, search } = req.query;
    let query = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.team_id,
        t.team_name,
        t.country,
        COALESCE(SUM(pf.runs_scored), 0) AS career_runs,
        COALESCE(SUM(pf.wickets_taken), 0) AS career_wickets,
        COUNT(DISTINCT pf.match_id) AS matches_played
      FROM Player p
      INNER JOIN Team t ON p.team_id = t.team_id
      LEFT JOIN Performance pf ON p.player_id = pf.player_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (team_id) {
      query += ` AND p.team_id = ?`;
      params.push(parseInt(team_id as string, 10));
    }
    if (role) {
      query += ` AND p.role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND p.player_name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += `
      GROUP BY p.player_id, p.player_name, p.role, p.team_id, t.team_name, t.country
      ORDER BY p.player_name ASC
    `;

    const players = db.prepare(query).all(...params);
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/players', (req: Request, res: Response) => {
  const { player_name, role, team_id } = req.body;
  if (!player_name || !role || !team_id) {
    return res.status(400).json({ error: 'Player name, valid role, and team are required.' });
  }

  const validRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const stmt = db.prepare('INSERT INTO Player (player_name, role, team_id) VALUES (?, ?, ?)');
    const result = stmt.run(player_name.trim(), role, parseInt(team_id, 10));
    res.status(201).json({
      player_id: Number(result.lastInsertRowid),
      player_name,
      role,
      team_id: parseInt(team_id, 10),
    });
  } catch (error: any) {
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({ error: 'Invalid team selected. Foreign key validation failed.' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/players/:id', (req: Request, res: Response) => {
  const player_id = parseInt(req.params.id, 10);
  const { player_name, role, team_id } = req.body;

  if (!player_name || !role || !team_id) {
    return res.status(400).json({ error: 'Player name, role, and team are required.' });
  }

  try {
    const stmt = db.prepare('UPDATE Player SET player_name = ?, role = ?, team_id = ? WHERE player_id = ?');
    const result = stmt.run(player_name.trim(), role, parseInt(team_id, 10), player_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    res.json({ player_id, player_name, role, team_id: parseInt(team_id, 10) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/players/:id', (req: Request, res: Response) => {
  const player_id = parseInt(req.params.id, 10);
  try {
    const stmt = db.prepare('DELETE FROM Player WHERE player_id = ?');
    const result = stmt.run(player_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Player not found.' });
    }
    res.json({ message: 'Player deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. MATCHES API (CRUD)
// ==========================================
app.get('/api/matches', (_req: Request, res: Response) => {
  try {
    const matches = db.prepare(`
      SELECT 
        m.match_id,
        m.match_date,
        m.venue,
        m.status,
        t1.team_id AS team1_id,
        t1.team_name AS team1_name,
        t1.country AS team1_country,
        t2.team_id AS team2_id,
        t2.team_name AS team2_name,
        t2.country AS team2_country,
        s1.score_id AS team1_score_id,
        s1.runs AS team1_runs,
        s1.wickets AS team1_wickets,
        s1.overs AS team1_overs,
        s2.score_id AS team2_score_id,
        s2.runs AS team2_runs,
        s2.wickets AS team2_wickets,
        s2.overs AS team2_overs
      FROM Match m
      INNER JOIN Team t1 ON m.team1_id = t1.team_id
      INNER JOIN Team t2 ON m.team2_id = t2.team_id
      LEFT JOIN Score s1 ON m.match_id = s1.match_id AND m.team1_id = s1.team_id
      LEFT JOIN Score s2 ON m.match_id = s2.match_id AND m.team2_id = s2.team_id
      ORDER BY m.match_date DESC
    `).all();
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/matches/:id', (req: Request, res: Response) => {
  const match_id = parseInt(req.params.id, 10);
  try {
    const match = db.prepare(`
      SELECT 
        m.match_id,
        m.match_date,
        m.venue,
        m.status,
        t1.team_id AS team1_id,
        t1.team_name AS team1_name,
        t1.country AS team1_country,
        t2.team_id AS team2_id,
        t2.team_name AS team2_name,
        t2.country AS team2_country,
        s1.score_id AS team1_score_id,
        s1.runs AS team1_runs,
        s1.wickets AS team1_wickets,
        s1.overs AS team1_overs,
        s2.score_id AS team2_score_id,
        s2.runs AS team2_runs,
        s2.wickets AS team2_wickets,
        s2.overs AS team2_overs
      FROM Match m
      INNER JOIN Team t1 ON m.team1_id = t1.team_id
      INNER JOIN Team t2 ON m.team2_id = t2.team_id
      LEFT JOIN Score s1 ON m.match_id = s1.match_id AND m.team1_id = s1.team_id
      LEFT JOIN Score s2 ON m.match_id = s2.match_id AND m.team2_id = s2.team_id
      WHERE m.match_id = ?
    `).get(match_id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    // Get individual performances for this match
    const performances = db.prepare(`
      SELECT 
        pf.performance_id,
        pf.match_id,
        pf.player_id,
        pf.runs_scored,
        pf.wickets_taken,
        pf.balls_faced,
        pf.overs_bowled,
        p.player_name,
        p.role,
        t.team_id,
        t.team_name
      FROM Performance pf
      INNER JOIN Player p ON pf.player_id = p.player_id
      INNER JOIN Team t ON p.team_id = t.team_id
      WHERE pf.match_id = ?
      ORDER BY pf.runs_scored DESC, pf.wickets_taken DESC
    `).all(match_id);

    res.json({ match, performances });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/matches', (req: Request, res: Response) => {
  const { team1_id, team2_id, match_date, venue, status } = req.body;
  if (!team1_id || !team2_id || !match_date || !venue) {
    return res.status(400).json({ error: 'Team 1, Team 2, Date, and Venue are required.' });
  }

  const t1 = parseInt(team1_id, 10);
  const t2 = parseInt(team2_id, 10);
  if (t1 === t2) {
    return res.status(400).json({ error: 'A team cannot play against itself (team1_id <> team2_id constraint violated).' });
  }

  const matchStatus = status || 'Scheduled';

  try {
    const stmt = db.prepare('INSERT INTO Match (team1_id, team2_id, match_date, venue, status) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(t1, t2, match_date, venue.trim(), matchStatus);
    res.status(201).json({
      match_id: Number(result.lastInsertRowid),
      team1_id: t1,
      team2_id: t2,
      match_date,
      venue,
      status: matchStatus,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/matches/:id', (req: Request, res: Response) => {
  const match_id = parseInt(req.params.id, 10);
  const { team1_id, team2_id, match_date, venue, status } = req.body;

  if (!team1_id || !team2_id || !match_date || !venue || !status) {
    return res.status(400).json({ error: 'All match fields are required.' });
  }

  const t1 = parseInt(team1_id, 10);
  const t2 = parseInt(team2_id, 10);
  if (t1 === t2) {
    return res.status(400).json({ error: 'Team 1 and Team 2 must be different teams.' });
  }

  try {
    const stmt = db.prepare('UPDATE Match SET team1_id = ?, team2_id = ?, match_date = ?, venue = ?, status = ? WHERE match_id = ?');
    const result = stmt.run(t1, t2, match_date, venue.trim(), status, match_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }
    res.json({ match_id, team1_id: t1, team2_id: t2, match_date, venue, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/matches/:id', (req: Request, res: Response) => {
  const match_id = parseInt(req.params.id, 10);
  try {
    const stmt = db.prepare('DELETE FROM Match WHERE match_id = ?');
    const result = stmt.run(match_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }
    res.json({ message: 'Match deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. SCORE MANAGEMENT API (CRUD)
// ==========================================
app.get('/api/scores', (_req: Request, res: Response) => {
  try {
    const scores = db.prepare(`
      SELECT 
        s.score_id,
        s.match_id,
        s.team_id,
        s.runs,
        s.wickets,
        s.overs,
        t.team_name,
        t.country,
        m.match_date,
        m.venue,
        m.status
      FROM Score s
      INNER JOIN Team t ON s.team_id = t.team_id
      INNER JOIN Match m ON s.match_id = m.match_id
      ORDER BY m.match_date DESC, s.match_id DESC
    `).all();
    res.json(scores);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scores', (req: Request, res: Response) => {
  const { match_id, team_id, runs, wickets, overs } = req.body;
  if (match_id === undefined || team_id === undefined || runs === undefined || wickets === undefined || overs === undefined) {
    return res.status(400).json({ error: 'match_id, team_id, runs, wickets, and overs are all required.' });
  }

  const mId = parseInt(match_id, 10);
  const tId = parseInt(team_id, 10);
  const r = parseInt(runs, 10);
  const w = parseInt(wickets, 10);
  const o = parseFloat(overs);

  if (r < 0) return res.status(400).json({ error: 'Runs cannot be negative.' });
  if (w < 0 || w > 10) return res.status(400).json({ error: 'Wickets must be between 0 and 10.' });
  if (o < 0 || o > 50) return res.status(400).json({ error: 'Overs must be between 0.0 and 50.0.' });

  // Verify that team_id is indeed participating in match_id
  const match = db.prepare('SELECT team1_id, team2_id FROM Match WHERE match_id = ?').get(mId) as { team1_id: number; team2_id: number } | undefined;
  if (!match) {
    return res.status(400).json({ error: 'Match does not exist.' });
  }
  if (match.team1_id !== tId && match.team2_id !== tId) {
    return res.status(400).json({ error: 'Selected team is not playing in this match.' });
  }

  try {
    // Check if score already exists (UPSERT or prevent duplicate)
    const existing = db.prepare('SELECT score_id FROM Score WHERE match_id = ? AND team_id = ?').get(mId, tId) as { score_id: number } | undefined;
    
    if (existing) {
      db.prepare('UPDATE Score SET runs = ?, wickets = ?, overs = ? WHERE score_id = ?').run(r, w, o, existing.score_id);
      return res.json({ message: 'Score updated successfully', score_id: existing.score_id, match_id: mId, team_id: tId, runs: r, wickets: w, overs: o });
    }

    const stmt = db.prepare('INSERT INTO Score (match_id, team_id, runs, wickets, overs) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(mId, tId, r, w, o);
    res.status(201).json({ score_id: Number(result.lastInsertRowid), match_id: mId, team_id: tId, runs: r, wickets: w, overs: o });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/scores/:id', (req: Request, res: Response) => {
  const score_id = parseInt(req.params.id, 10);
  const { runs, wickets, overs } = req.body;

  const r = parseInt(runs, 10);
  const w = parseInt(wickets, 10);
  const o = parseFloat(overs);

  if (r < 0 || w < 0 || w > 10 || o < 0 || o > 50) {
    return res.status(400).json({ error: 'Invalid score values. Wickets 0-10, Overs 0-50, Runs >= 0.' });
  }

  try {
    const stmt = db.prepare('UPDATE Score SET runs = ?, wickets = ?, overs = ? WHERE score_id = ?');
    const result = stmt.run(r, w, o, score_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Score record not found.' });
    }
    res.json({ message: 'Score updated successfully', score_id, runs: r, wickets: w, overs: o });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/scores/:id', (req: Request, res: Response) => {
  const score_id = parseInt(req.params.id, 10);
  try {
    const stmt = db.prepare('DELETE FROM Score WHERE score_id = ?');
    const result = stmt.run(score_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Score record not found.' });
    }
    res.json({ message: 'Score deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. PLAYER PERFORMANCE API (CRUD)
// ==========================================
app.get('/api/performances', (req: Request, res: Response) => {
  try {
    const { match_id, player_id } = req.query;
    let query = `
      SELECT 
        pf.performance_id,
        pf.match_id,
        pf.player_id,
        pf.runs_scored,
        pf.wickets_taken,
        pf.balls_faced,
        pf.overs_bowled,
        p.player_name,
        p.role,
        t.team_name,
        m.match_date,
        m.venue
      FROM Performance pf
      INNER JOIN Player p ON pf.player_id = p.player_id
      INNER JOIN Team t ON p.team_id = t.team_id
      INNER JOIN Match m ON pf.match_id = m.match_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (match_id) {
      query += ` AND pf.match_id = ?`;
      params.push(parseInt(match_id as string, 10));
    }
    if (player_id) {
      query += ` AND pf.player_id = ?`;
      params.push(parseInt(player_id as string, 10));
    }

    query += ` ORDER BY pf.match_id DESC, pf.runs_scored DESC, pf.wickets_taken DESC`;
    const list = db.prepare(query).all(...params);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/performances', (req: Request, res: Response) => {
  const { match_id, player_id, runs_scored, wickets_taken, balls_faced, overs_bowled } = req.body;
  if (!match_id || !player_id) {
    return res.status(400).json({ error: 'match_id and player_id are required.' });
  }

  const mId = parseInt(match_id, 10);
  const pId = parseInt(player_id, 10);
  const runs = parseInt(runs_scored ?? 0, 10);
  const wickets = parseInt(wickets_taken ?? 0, 10);
  const balls = parseInt(balls_faced ?? 0, 10);
  const overs = parseFloat(overs_bowled ?? 0.0);

  if (runs < 0 || wickets < 0 || wickets > 10 || balls < 0 || overs < 0) {
    return res.status(400).json({ error: 'Invalid performance numbers.' });
  }

  try {
    const existing = db.prepare('SELECT performance_id FROM Performance WHERE match_id = ? AND player_id = ?').get(mId, pId) as { performance_id: number } | undefined;
    if (existing) {
      db.prepare(`
        UPDATE Performance 
        SET runs_scored = ?, wickets_taken = ?, balls_faced = ?, overs_bowled = ?
        WHERE performance_id = ?
      `).run(runs, wickets, balls, overs, existing.performance_id);
      return res.json({ message: 'Performance updated', performance_id: existing.performance_id });
    }

    const stmt = db.prepare(`
      INSERT INTO Performance (match_id, player_id, runs_scored, wickets_taken, balls_faced, overs_bowled)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(mId, pId, runs, wickets, balls, overs);
    res.status(201).json({ performance_id: Number(result.lastInsertRowid) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/performances/:id', (req: Request, res: Response) => {
  const performance_id = parseInt(req.params.id, 10);
  const { runs_scored, wickets_taken, balls_faced, overs_bowled } = req.body;

  const runs = parseInt(runs_scored ?? 0, 10);
  const wickets = parseInt(wickets_taken ?? 0, 10);
  const balls = parseInt(balls_faced ?? 0, 10);
  const overs = parseFloat(overs_bowled ?? 0.0);

  try {
    const stmt = db.prepare(`
      UPDATE Performance 
      SET runs_scored = ?, wickets_taken = ?, balls_faced = ?, overs_bowled = ?
      WHERE performance_id = ?
    `);
    const result = stmt.run(runs, wickets, balls, overs, performance_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Performance record not found.' });
    }
    res.json({ message: 'Performance record updated.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/performances/:id', (req: Request, res: Response) => {
  const performance_id = parseInt(req.params.id, 10);
  try {
    const stmt = db.prepare('DELETE FROM Performance WHERE performance_id = ?');
    const result = stmt.run(performance_id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Performance record not found.' });
    }
    res.json({ message: 'Performance record deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// In-memory recent live ball commentary buffer per match
const liveCommentaryBuffer: Record<number, Array<{
  id: string;
  over: string;
  runs: number;
  isWicket: boolean;
  commentary: string;
  batsman: string;
  bowler: string;
  timestamp: string;
  executedSql: string;
}>> = {};

app.get('/api/matches/:id/live-balls', (req: Request, res: Response) => {
  const match_id = parseInt(req.params.id, 10);
  res.json(liveCommentaryBuffer[match_id] || []);
});

app.post('/api/matches/:id/simulate-ball', (req: Request, res: Response) => {
  const match_id = parseInt(req.params.id, 10);

  try {
    const match = db.prepare(`
      SELECT m.*, t1.team_name as team1_name, t2.team_name as team2_name
      FROM Match m
      INNER JOIN Team t1 ON m.team1_id = t1.team_id
      INNER JOIN Team t2 ON m.team2_id = t2.team_id
      WHERE m.match_id = ?
    `).get(match_id) as any;

    if (!match) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    // Ensure scores exist for both teams
    let score1 = db.prepare('SELECT * FROM Score WHERE match_id = ? AND team_id = ?').get(match_id, match.team1_id) as any;
    if (!score1) {
      db.prepare('INSERT INTO Score (match_id, team_id, runs, wickets, overs) VALUES (?, ?, 0, 0, 0.0)').run(match_id, match.team1_id);
      score1 = db.prepare('SELECT * FROM Score WHERE match_id = ? AND team_id = ?').get(match_id, match.team1_id) as any;
    }

    let score2 = db.prepare('SELECT * FROM Score WHERE match_id = ? AND team_id = ?').get(match_id, match.team2_id) as any;
    if (!score2) {
      db.prepare('INSERT INTO Score (match_id, team_id, runs, wickets, overs) VALUES (?, ?, 0, 0, 0.0)').run(match_id, match.team2_id);
      score2 = db.prepare('SELECT * FROM Score WHERE match_id = ? AND team_id = ?').get(match_id, match.team2_id) as any;
    }

    // Decide which team is batting:
    // If team 1 hasn't completed 50 overs or lost 10 wickets, team 1 is batting.
    // Otherwise, team 2 is batting.
    let battingScore = score1;
    let bowlingTeamId = match.team2_id;
    let battingTeamName = match.team1_name;
    let bowlingTeamName = match.team2_name;

    const team1Finished = score1.wickets >= 10 || score1.overs >= 50.0;
    if (team1Finished) {
      battingScore = score2;
      bowlingTeamId = match.team1_id;
      battingTeamName = match.team2_name;
      bowlingTeamName = match.team1_name;
    }

    // Check if match already completed
    if (team1Finished && (score2.wickets >= 10 || score2.overs >= 50.0 || score2.runs > score1.runs)) {
      db.prepare("UPDATE Match SET status = 'Completed' WHERE match_id = ?").run(match_id);
      return res.json({
        completed: true,
        message: 'Match is already completed! Target reached or all out.',
        match: { ...match, status: 'Completed' },
      });
    }

    // Update match status to 'In Progress' if scheduled
    if (match.status === 'Scheduled') {
      db.prepare("UPDATE Match SET status = 'In Progress' WHERE match_id = ?").run(match_id);
    }

    // Convert overs e.g. 18.2 -> total balls bowled = 18 * 6 + 2 = 110 balls
    const wholeOvers = Math.floor(battingScore.overs);
    const ballsInOver = Math.round((battingScore.overs - wholeOvers) * 10);
    const totalBalls = wholeOvers * 6 + ballsInOver + 1;

    const newWholeOvers = Math.floor(totalBalls / 6);
    const newBallsInOver = totalBalls % 6;
    const newOvers = parseFloat(`${newWholeOvers}.${newBallsInOver}`);
    const overStr = `${newWholeOvers}.${newBallsInOver}`;

    // Realistic outcome distribution
    const rand = Math.random();
    let outcomeRuns = 0;
    let isWicket = false;
    let desc = '';

    if (rand < 0.38) {
      outcomeRuns = 0;
      desc = 'no run, defended cleanly back towards the bowler.';
    } else if (rand < 0.68) {
      outcomeRuns = 1;
      desc = 'tucked neatly off the pads into the mid-wicket gap for a sharp single.';
    } else if (rand < 0.78) {
      outcomeRuns = 2;
      desc = 'driven through extra cover, good hustle between the wickets for two.';
    } else if (rand < 0.88) {
      outcomeRuns = 4;
      desc = 'FOUR! Cracked through point with exquisite timing, races away to the fence!';
    } else if (rand < 0.94) {
      outcomeRuns = 6;
      desc = 'SIX! Magnificent swing of the willow, sails clean over deep mid-wicket into the stands!';
    } else {
      isWicket = true;
      outcomeRuns = 0;
      desc = 'OUT! WICKET FALLS! Edged and caught behind by the wicket-keeper!';
    }

    const newRuns = battingScore.runs + outcomeRuns;
    const newWickets = Math.min(10, battingScore.wickets + (isWicket ? 1 : 0));

    // Update SQLite Score table via SQL UPDATE statement
    const updateSql = `UPDATE Score SET runs = ${newRuns}, wickets = ${newWickets}, overs = ${newOvers} WHERE score_id = ${battingScore.score_id}`;
    db.prepare('UPDATE Score SET runs = ?, wickets = ?, overs = ? WHERE score_id = ?')
      .run(newRuns, newWickets, newOvers, battingScore.score_id);

    // Pick active players for performance update
    const batsmen = db.prepare('SELECT player_id, player_name FROM Player WHERE team_id = ? LIMIT 2').all(battingScore.team_id) as any[];
    const bowlers = db.prepare('SELECT player_id, player_name FROM Player WHERE team_id = ? AND role IN (\'Bowler\', \'All-Rounder\') LIMIT 1').all(bowlingTeamId) as any[];

    const batsman = batsmen.length > 0 ? batsmen[0] : { player_id: null, player_name: 'Striker' };
    const bowler = bowlers.length > 0 ? bowlers[0] : { player_id: null, player_name: 'Bowler' };

    // Update batsman performance
    if (batsman.player_id) {
      const existingPerf = db.prepare('SELECT performance_id, runs_scored, balls_faced FROM Performance WHERE match_id = ? AND player_id = ?').get(match_id, batsman.player_id) as any;
      if (existingPerf) {
        db.prepare('UPDATE Performance SET runs_scored = runs_scored + ?, balls_faced = balls_faced + 1 WHERE performance_id = ?')
          .run(outcomeRuns, existingPerf.performance_id);
      } else {
        db.prepare('INSERT INTO Performance (match_id, player_id, runs_scored, balls_faced, wickets_taken, overs_bowled) VALUES (?, ?, ?, 1, 0, 0.0)')
          .run(match_id, batsman.player_id, outcomeRuns);
      }
    }

    // Update bowler performance if wicket or over completed
    if (bowler.player_id && isWicket) {
      const existingBowler = db.prepare('SELECT performance_id FROM Performance WHERE match_id = ? AND player_id = ?').get(match_id, bowler.player_id) as any;
      if (existingBowler) {
        db.prepare('UPDATE Performance SET wickets_taken = wickets_taken + 1 WHERE performance_id = ?').run(existingBowler.performance_id);
      } else {
        db.prepare('INSERT INTO Performance (match_id, player_id, runs_scored, balls_faced, wickets_taken, overs_bowled) VALUES (?, ?, 0, 0, 1, 1.0)')
          .run(match_id, bowler.player_id);
      }
    }

    // Check if match completed on this ball
    let matchFinished = false;
    if (team1Finished && (newRuns > score1.runs || newWickets >= 10 || newOvers >= 50.0)) {
      db.prepare("UPDATE Match SET status = 'Completed' WHERE match_id = ?").run(match_id);
      matchFinished = true;
    } else if (!team1Finished && (newWickets >= 10 || newOvers >= 50.0)) {
      // 1st innings finished, innings break
      desc += ' (End of 1st Innings)';
    }

    const ballEvent = {
      id: `${Date.now()}-${Math.random()}`,
      over: overStr,
      runs: outcomeRuns,
      isWicket,
      commentary: `${overStr} | ${batsman.player_name} facing ${bowler.player_name}: ${desc}`,
      batsman: batsman.player_name,
      bowler: bowler.player_name,
      timestamp: new Date().toLocaleTimeString(),
      executedSql: updateSql,
    };

    if (!liveCommentaryBuffer[match_id]) {
      liveCommentaryBuffer[match_id] = [];
    }
    liveCommentaryBuffer[match_id].unshift(ballEvent);
    if (liveCommentaryBuffer[match_id].length > 25) {
      liveCommentaryBuffer[match_id].pop();
    }

    res.json({
      success: true,
      completed: matchFinished,
      battingTeam: battingTeamName,
      bowlingTeam: bowlingTeamName,
      ball: ballEvent,
      updatedScore: {
        score_id: battingScore.score_id,
        team_id: battingScore.team_id,
        team_name: battingTeamName,
        runs: newRuns,
        wickets: newWickets,
        overs: newOvers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. INTERACTIVE SQL QUERY RUNNER (DBMS VIVA)
// ==========================================
app.post('/api/sql/execute', (req: Request, res: Response) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL statement string is required.' });
  }

  const cleanSql = sql.trim();
  const startTime = performance.now();

  try {
    // Determine query type
    const upper = cleanSql.toUpperCase();
    const isSelect = upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.startsWith('PRAGMA');

    if (isSelect) {
      const stmt = db.prepare(cleanSql);
      const rows = stmt.all();
      const endTime = performance.now();
      const columns = rows.length > 0 ? Object.keys(rows[0] as Record<string, any>) : [];
      return res.json({
        success: true,
        type: 'DQL',
        columns,
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      });
    } else {
      // DDL or DML (INSERT, UPDATE, DELETE, CREATE, DROP, ALTER)
      const stmt = db.prepare(cleanSql);
      const result = stmt.run();
      const endTime = performance.now();
      return res.json({
        success: true,
        type: upper.startsWith('CREATE') || upper.startsWith('ALTER') ? 'DDL' : 'DML',
        changes: result.changes,
        lastInsertRowid: Number(result.lastInsertRowid),
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
      });
    }
  } catch (error: any) {
    const endTime = performance.now();
    return res.status(400).json({
      success: false,
      error: error.message,
      executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
    });
  }
});

// ==========================================
// 8. DATABASE RESET & SAMPLE DATA SEEDING
// ==========================================
app.post('/api/reset', (_req: Request, res: Response) => {
  try {
    seedSampleData(true);
    res.json({ message: 'Database successfully reset to standard academic sample data.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC SERVE
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
