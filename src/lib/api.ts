import {
  DashboardStats,
  Team,
  Player,
  Match,
  Score,
  Performance,
  SqlExecutionResult,
} from '../types/cricket';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorBody.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  async getDatabaseHealth(): Promise<{
    ok: boolean;
    engine: string;
    foreignKeys: boolean;
    tables: string[];
    counts: { teams: number; players: number; matches: number };
  }> {
    const res = await fetch('/api/health');
    return handleResponse(res);
  },

  // Stats
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    return handleResponse<DashboardStats>(res);
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const res = await fetch('/api/teams');
    return handleResponse<Team[]>(res);
  },

  async createTeam(data: { team_name: string; country: string }): Promise<Team> {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Team>(res);
  },

  async updateTeam(id: number, data: { team_name: string; country: string }): Promise<Team> {
    const res = await fetch(`/api/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Team>(res);
  },

  async deleteTeam(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Players
  async getPlayers(params?: { team_id?: number; role?: string; search?: string }): Promise<Player[]> {
    const searchParams = new URLSearchParams();
    if (params?.team_id) searchParams.set('team_id', params.team_id.toString());
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);

    const url = `/api/players${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Player[]>(res);
  },

  async createPlayer(data: { player_name: string; role: string; team_id: number }): Promise<Player> {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Player>(res);
  },

  async updatePlayer(id: number, data: { player_name: string; role: string; team_id: number }): Promise<Player> {
    const res = await fetch(`/api/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Player>(res);
  },

  async deletePlayer(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Matches
  async getMatches(): Promise<Match[]> {
    const res = await fetch('/api/matches');
    return handleResponse<Match[]>(res);
  },

  async getMatchDetails(id: number): Promise<{ match: Match; performances: Performance[] }> {
    const res = await fetch(`/api/matches/${id}`);
    return handleResponse<{ match: Match; performances: Performance[] }>(res);
  },

  async createMatch(data: { team1_id: number; team2_id: number; match_date: string; venue: string; status?: string }): Promise<Match> {
    const res = await fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Match>(res);
  },

  async updateMatch(id: number, data: { team1_id: number; team2_id: number; match_date: string; venue: string; status: string }): Promise<Match> {
    const res = await fetch(`/api/matches/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Match>(res);
  },

  async deleteMatch(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Scores
  async getScores(): Promise<Score[]> {
    const res = await fetch('/api/scores');
    return handleResponse<Score[]>(res);
  },

  async saveScore(data: { match_id: number; team_id: number; runs: number; wickets: number; overs: number }): Promise<Score> {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Score>(res);
  },

  async deleteScore(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // Live Match Simulator
  async simulateBall(matchId: number): Promise<any> {
    const res = await fetch(`/api/matches/${matchId}/simulate-ball`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<any>(res);
  },

  async getLiveBalls(matchId: number): Promise<any[]> {
    const res = await fetch(`/api/matches/${matchId}/live-balls`);
    return handleResponse<any[]>(res);
  },

  // Performances
  async getPerformances(params?: { match_id?: number; player_id?: number }): Promise<Performance[]> {
    const searchParams = new URLSearchParams();
    if (params?.match_id) searchParams.set('match_id', params.match_id.toString());
    if (params?.player_id) searchParams.set('player_id', params.player_id.toString());

    const url = `/api/performances${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Performance[]>(res);
  },

  async savePerformance(data: {
    match_id: number;
    player_id: number;
    runs_scored: number;
    wickets_taken: number;
    balls_faced: number;
    overs_bowled: number;
  }): Promise<{ message?: string; performance_id?: number }> {
    const res = await fetch('/api/performances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message?: string; performance_id?: number }>(res);
  },

  async deletePerformance(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/performances/${id}`, { method: 'DELETE' });
    return handleResponse<{ message: string }>(res);
  },

  // SQL Query Execution
  async executeSql(sql: string): Promise<SqlExecutionResult> {
    const res = await fetch('/api/sql/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    return res.json();
  },

  // Reset DB
  async resetDatabase(): Promise<{ message: string }> {
    const res = await fetch('/api/reset', { method: 'POST' });
    return handleResponse<{ message: string }>(res);
  },
};
