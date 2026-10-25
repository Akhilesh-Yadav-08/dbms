import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'cricket_dbms.sqlite');
export const db = new Database(dbPath);

// Crucial for DBMS projects: enforce foreign key constraints
db.pragma('foreign_keys = ON');

/**
 * Initialize Database Schema with 5 core relational tables:
 * 1. Team
 * 2. Player
 * 3. Match
 * 4. Score
 * 5. Performance
 */
export function initializeSchema() {
  db.exec(`
    -- 1. Team Table
    CREATE TABLE IF NOT EXISTS Team (
      team_id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_name TEXT NOT NULL UNIQUE,
      country TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Player Table
    CREATE TABLE IF NOT EXISTS Player (
      player_id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper')),
      team_id INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE
    );

    -- 3. Match Table
    CREATE TABLE IF NOT EXISTS Match (
      match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      team1_id INTEGER NOT NULL,
      team2_id INTEGER NOT NULL,
      match_date TEXT NOT NULL,
      venue TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Scheduled', 'In Progress', 'Completed')),
      FOREIGN KEY (team1_id) REFERENCES Team(team_id) ON DELETE CASCADE,
      FOREIGN KEY (team2_id) REFERENCES Team(team_id) ON DELETE CASCADE,
      CHECK (team1_id <> team2_id)
    );

    -- 4. Score Table
    CREATE TABLE IF NOT EXISTS Score (
      score_id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      runs INTEGER NOT NULL DEFAULT 0 CHECK(runs >= 0),
      wickets INTEGER NOT NULL DEFAULT 0 CHECK(wickets BETWEEN 0 AND 10),
      overs REAL NOT NULL DEFAULT 0.0 CHECK(overs >= 0.0 AND overs <= 50.0),
      FOREIGN KEY (match_id) REFERENCES Match(match_id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES Team(team_id) ON DELETE CASCADE,
      UNIQUE(match_id, team_id)
    );

    -- 5. Performance Table
    CREATE TABLE IF NOT EXISTS Performance (
      performance_id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      runs_scored INTEGER NOT NULL DEFAULT 0 CHECK(runs_scored >= 0),
      wickets_taken INTEGER NOT NULL DEFAULT 0 CHECK(wickets_taken BETWEEN 0 AND 10),
      balls_faced INTEGER NOT NULL DEFAULT 0 CHECK(balls_faced >= 0),
      overs_bowled REAL NOT NULL DEFAULT 0.0 CHECK(overs_bowled >= 0.0),
      FOREIGN KEY (match_id) REFERENCES Match(match_id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES Player(player_id) ON DELETE CASCADE,
      UNIQUE(match_id, player_id)
    );
  `);
}

/**
 * Seed initial realistic cricket tournament dataset
 */
export function seedSampleData(force = false) {
  const teamCount = (db.prepare('SELECT COUNT(*) as count FROM Team').get() as { count: number }).count;
  
  if (teamCount > 0 && !force) {
    return; // Already seeded
  }

  // Clear existing data in correct relational reverse order
  db.exec(`
    DELETE FROM Performance;
    DELETE FROM Score;
    DELETE FROM Match;
    DELETE FROM Player;
    DELETE FROM Team;
  `);

  const insertTeam = db.prepare('INSERT INTO Team (team_name, country) VALUES (?, ?)');
  const teams = [
    { name: 'India', country: 'India' },
    { name: 'Australia', country: 'Australia' },
    { name: 'England', country: 'England' },
    { name: 'South Africa', country: 'South Africa' },
    { name: 'New Zealand', country: 'New Zealand' },
    { name: 'West Indies', country: 'West Indies' },
  ];

  const teamIds: Record<string, number> = {};
  for (const t of teams) {
    const res = insertTeam.run(t.name, t.country);
    teamIds[t.name] = Number(res.lastInsertRowid);
  }

  const insertPlayer = db.prepare('INSERT INTO Player (player_name, role, team_id) VALUES (?, ?, ?)');
  const players = [
    // India
    { name: 'Rohit Sharma', role: 'Batsman', team: 'India' },
    { name: 'Virat Kohli', role: 'Batsman', team: 'India' },
    { name: 'KL Rahul', role: 'Wicket-Keeper', team: 'India' },
    { name: 'Hardik Pandya', role: 'All-Rounder', team: 'India' },
    { name: 'Ravindra Jadeja', role: 'All-Rounder', team: 'India' },
    { name: 'Jasprit Bumrah', role: 'Bowler', team: 'India' },
    { name: 'Mohammed Shami', role: 'Bowler', team: 'India' },

    // Australia
    { name: 'David Warner', role: 'Batsman', team: 'Australia' },
    { name: 'Travis Head', role: 'Batsman', team: 'Australia' },
    { name: 'Steve Smith', role: 'Batsman', team: 'Australia' },
    { name: 'Glenn Maxwell', role: 'All-Rounder', team: 'Australia' },
    { name: 'Alex Carey', role: 'Wicket-Keeper', team: 'Australia' },
    { name: 'Pat Cummins', role: 'Bowler', team: 'Australia' },
    { name: 'Mitchell Starc', role: 'Bowler', team: 'Australia' },

    // England
    { name: 'Jos Buttler', role: 'Wicket-Keeper', team: 'England' },
    { name: 'Joe Root', role: 'Batsman', team: 'England' },
    { name: 'Ben Stokes', role: 'All-Rounder', team: 'England' },
    { name: 'Harry Brook', role: 'Batsman', team: 'England' },
    { name: 'Jofra Archer', role: 'Bowler', team: 'England' },
    { name: 'Adil Rashid', role: 'Bowler', team: 'England' },

    // South Africa
    { name: 'Quinton de Kock', role: 'Wicket-Keeper', team: 'South Africa' },
    { name: 'Aiden Markram', role: 'Batsman', team: 'South Africa' },
    { name: 'Heinrich Klaasen', role: 'Batsman', team: 'South Africa' },
    { name: 'Marco Jansen', role: 'All-Rounder', team: 'South Africa' },
    { name: 'Kagiso Rabada', role: 'Bowler', team: 'South Africa' },
    { name: 'Keshav Maharaj', role: 'Bowler', team: 'South Africa' },

    // New Zealand
    { name: 'Kane Williamson', role: 'Batsman', team: 'New Zealand' },
    { name: 'Devon Conway', role: 'Wicket-Keeper', team: 'New Zealand' },
    { name: 'Daryl Mitchell', role: 'All-Rounder', team: 'New Zealand' },
    { name: 'Mitchell Santner', role: 'All-Rounder', team: 'New Zealand' },
    { name: 'Trent Boult', role: 'Bowler', team: 'New Zealand' },

    // West Indies
    { name: 'Nicholas Pooran', role: 'Wicket-Keeper', team: 'West Indies' },
    { name: 'Shai Hope', role: 'Batsman', team: 'West Indies' },
    { name: 'Andre Russell', role: 'All-Rounder', team: 'West Indies' },
    { name: 'Jason Holder', role: 'All-Rounder', team: 'West Indies' },
    { name: 'Alzarri Joseph', role: 'Bowler', team: 'West Indies' },
  ];

  const playerIds: Record<string, number> = {};
  for (const p of players) {
    const res = insertPlayer.run(p.name, p.role, teamIds[p.team]);
    playerIds[p.name] = Number(res.lastInsertRowid);
  }

  // Matches
  const insertMatch = db.prepare('INSERT INTO Match (team1_id, team2_id, match_date, venue, status) VALUES (?, ?, ?, ?, ?)');
  
  // Match 1: India vs Australia (Completed)
  const m1 = insertMatch.run(teamIds['India'], teamIds['Australia'], '2026-10-18', 'Wankhede Stadium, Mumbai', 'Completed');
  const m1Id = Number(m1.lastInsertRowid);

  // Match 2: England vs South Africa (Completed)
  const m2 = insertMatch.run(teamIds['England'], teamIds['South Africa'], '2026-10-20', 'Lord\'s Cricket Ground, London', 'Completed');
  const m2Id = Number(m2.lastInsertRowid);

  // Match 3: New Zealand vs West Indies (Completed)
  const m3 = insertMatch.run(teamIds['New Zealand'], teamIds['West Indies'], '2026-10-22', 'Eden Park, Auckland', 'Completed');
  const m3Id = Number(m3.lastInsertRowid);

  // Match 4: India vs England (In Progress)
  const m4 = insertMatch.run(teamIds['India'], teamIds['England'], '2026-10-24', 'Eden Gardens, Kolkata', 'In Progress');
  const m4Id = Number(m4.lastInsertRowid);

  // Match 5: Australia vs South Africa (Scheduled)
  insertMatch.run(teamIds['Australia'], teamIds['South Africa'], '2026-10-28', 'Melbourne Cricket Ground, Melbourne', 'Scheduled');

  // Scores
  const insertScore = db.prepare('INSERT INTO Score (match_id, team_id, runs, wickets, overs) VALUES (?, ?, ?, ?, ?)');
  
  // Match 1 Scores: India 328/7 in 50.0 ov; Australia 292/10 in 47.4 ov
  insertScore.run(m1Id, teamIds['India'], 328, 7, 50.0);
  insertScore.run(m1Id, teamIds['Australia'], 292, 10, 47.4);

  // Match 2 Scores: England 315/8 in 50.0 ov; South Africa 318/6 in 48.5 ov
  insertScore.run(m2Id, teamIds['England'], 315, 8, 50.0);
  insertScore.run(m2Id, teamIds['South Africa'], 318, 6, 48.5);

  // Match 3 Scores: New Zealand 274/9 in 50.0 ov; West Indies 260/10 in 46.2 ov
  insertScore.run(m3Id, teamIds['New Zealand'], 274, 9, 50.0);
  insertScore.run(m3Id, teamIds['West Indies'], 260, 10, 46.2);

  // Match 4 Scores: India 342/5 in 50.0 ov; England 112/3 in 18.0 ov
  insertScore.run(m4Id, teamIds['India'], 342, 5, 50.0);
  insertScore.run(m4Id, teamIds['England'], 112, 3, 18.0);

  // Individual Performances
  const insertPerf = db.prepare(`
    INSERT INTO Performance (match_id, player_id, runs_scored, wickets_taken, balls_faced, overs_bowled)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Match 1 Performances
  insertPerf.run(m1Id, playerIds['Rohit Sharma'], 87, 0, 76, 0.0);
  insertPerf.run(m1Id, playerIds['Virat Kohli'], 117, 0, 108, 0.0);
  insertPerf.run(m1Id, playerIds['Hardik Pandya'], 42, 1, 28, 6.0);
  insertPerf.run(m1Id, playerIds['Jasprit Bumrah'], 4, 3, 6, 9.4);
  insertPerf.run(m1Id, playerIds['Mohammed Shami'], 0, 4, 2, 10.0);
  insertPerf.run(m1Id, playerIds['Travis Head'], 78, 0, 62, 0.0);
  insertPerf.run(m1Id, playerIds['Steve Smith'], 64, 0, 71, 0.0);
  insertPerf.run(m1Id, playerIds['Pat Cummins'], 19, 2, 14, 10.0);
  insertPerf.run(m1Id, playerIds['Mitchell Starc'], 8, 3, 9, 10.0);

  // Match 2 Performances
  insertPerf.run(m2Id, playerIds['Joe Root'], 106, 0, 112, 0.0);
  insertPerf.run(m2Id, playerIds['Ben Stokes'], 74, 1, 58, 7.0);
  insertPerf.run(m2Id, playerIds['Jofra Archer'], 12, 2, 8, 10.0);
  insertPerf.run(m2Id, playerIds['Quinton de Kock'], 84, 0, 79, 0.0);
  insertPerf.run(m2Id, playerIds['Heinrich Klaasen'], 92, 0, 64, 0.0);
  insertPerf.run(m2Id, playerIds['Kagiso Rabada'], 2, 3, 3, 10.0);

  // Match 3 Performances
  insertPerf.run(m3Id, playerIds['Kane Williamson'], 95, 0, 104, 0.0);
  insertPerf.run(m3Id, playerIds['Trent Boult'], 6, 4, 5, 9.2);
  insertPerf.run(m3Id, playerIds['Nicholas Pooran'], 81, 0, 69, 0.0);
  insertPerf.run(m3Id, playerIds['Alzarri Joseph'], 14, 3, 12, 10.0);

  // Match 4 Performances
  insertPerf.run(m4Id, playerIds['Virat Kohli'], 128, 0, 114, 0.0);
  insertPerf.run(m4Id, playerIds['KL Rahul'], 82, 0, 70, 0.0);
  insertPerf.run(m4Id, playerIds['Ravindra Jadeja'], 35, 1, 22, 4.0);
  insertPerf.run(m4Id, playerIds['Jos Buttler'], 48, 0, 40, 0.0);
}

// Initialize immediately on server boot
initializeSchema();
seedSampleData(false);
