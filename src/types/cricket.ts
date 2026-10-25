export interface Team {
  team_id: number;
  team_name: string;
  country: string;
  created_at?: string;
  player_count?: number;
}

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';

export interface Player {
  player_id: number;
  player_name: string;
  role: PlayerRole;
  team_id: number;
  team_name?: string;
  country?: string;
  career_runs?: number;
  career_wickets?: number;
  matches_played?: number;
}

export type MatchStatus = 'Scheduled' | 'In Progress' | 'Completed';

export interface Match {
  match_id: number;
  team1_id: number;
  team1_name: string;
  team1_country: string;
  team2_id: number;
  team2_name: string;
  team2_country: string;
  match_date: string;
  venue: string;
  status: MatchStatus;
  team1_score_id?: number | null;
  team1_runs?: number | null;
  team1_wickets?: number | null;
  team1_overs?: number | null;
  team2_score_id?: number | null;
  team2_runs?: number | null;
  team2_wickets?: number | null;
  team2_overs?: number | null;
}

export interface Score {
  score_id: number;
  match_id: number;
  team_id: number;
  runs: number;
  wickets: number;
  overs: number;
  team_name?: string;
  country?: string;
  match_date?: string;
  venue?: string;
  status?: MatchStatus;
}

export interface Performance {
  performance_id: number;
  match_id: number;
  player_id: number;
  runs_scored: number;
  wickets_taken: number;
  balls_faced: number;
  overs_bowled: number;
  player_name?: string;
  role?: PlayerRole;
  team_id?: number;
  team_name?: string;
  match_date?: string;
  venue?: string;
}

export interface TopScorer {
  player_id: number;
  player_name: string;
  role: PlayerRole;
  team_name: string;
  total_runs: number;
  total_balls: number;
  innings_played: number;
}

export interface TopBowler {
  player_id: number;
  player_name: string;
  role: PlayerRole;
  team_name: string;
  total_wickets: number;
  total_overs: number;
  matches_played: number;
}

export interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  completedMatches: number;
  totalRuns: number;
  totalWickets: number;
  topScorers: TopScorer[];
  topBowlers: TopBowler[];
  recentMatches: Match[];
}

export interface SqlExecutionResult {
  success: boolean;
  type?: 'DQL' | 'DML' | 'DDL';
  columns?: string[];
  rows?: Record<string, any>[];
  rowCount?: number;
  changes?: number;
  lastInsertRowid?: number;
  executionTimeMs?: number;
  error?: string;
}
