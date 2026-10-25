import React, { useEffect, useState } from 'react';
import {
  Play,
  Database,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  Table as TableIcon,
  Code2,
  HelpCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { SqlExecutionResult } from '../types/cricket';
import { useTheme } from '../context/ThemeContext';

const PRESET_QUERIES = [
  {
    name: 'DQL: Dual Inner Join Match Scorecards',
    category: 'Relational Joins',
    description: 'Retrieves matches with team names and both innings scores via dual joins.',
    sql: `SELECT 
  m.match_id,
  m.match_date,
  m.venue,
  m.status,
  t1.team_name AS team1,
  t2.team_name AS team2,
  s1.runs || '/' || s1.wickets || ' (' || s1.overs || ' ov)' AS team1_score,
  s2.runs || '/' || s2.wickets || ' (' || s2.overs || ' ov)' AS team2_score
FROM Match m
INNER JOIN Team t1 ON m.team1_id = t1.team_id
INNER JOIN Team t2 ON m.team2_id = t2.team_id
LEFT JOIN Score s1 ON m.match_id = s1.match_id AND m.team1_id = s1.team_id
LEFT JOIN Score s2 ON m.match_id = s2.match_id AND m.team2_id = s2.team_id
ORDER BY m.match_date DESC;`,
  },
  {
    name: 'Aggregates: Tournament Top Scorers (SUM & GROUP BY)',
    category: 'Aggregates',
    description: 'Aggregates individual match performances to compute career tournament runs.',
    sql: `SELECT 
  p.player_name,
  t.team_name,
  p.role,
  SUM(pf.runs_scored) AS total_runs,
  SUM(pf.balls_faced) AS total_balls,
  ROUND((CAST(SUM(pf.runs_scored) AS REAL) / NULLIF(SUM(pf.balls_faced), 0)) * 100, 2) AS strike_rate,
  COUNT(pf.match_id) AS innings
FROM Player p
INNER JOIN Team t ON p.team_id = t.team_id
INNER JOIN Performance pf ON p.player_id = pf.player_id
GROUP BY p.player_id, p.player_name, t.team_name, p.role
ORDER BY total_runs DESC
LIMIT 5;`,
  },
  {
    name: 'Aggregates: Player Count per Team (COUNT & LEFT JOIN)',
    category: 'Aggregates',
    description: 'Counts players registered per team using LEFT JOIN and GROUP BY.',
    sql: `SELECT 
  t.team_id,
  t.team_name,
  t.country,
  COUNT(p.player_id) AS total_players
FROM Team t
LEFT JOIN Player p ON t.team_id = p.team_id
GROUP BY t.team_id, t.team_name, t.country
ORDER BY total_players DESC, t.team_name ASC;`,
  },
  {
    name: 'DQL: Leading Wicket Takers (SUM & ORDER BY)',
    category: 'Aggregates',
    description: 'Calculates top wicket takers and total overs bowled.',
    sql: `SELECT 
  p.player_name,
  t.team_name,
  SUM(pf.wickets_taken) AS total_wickets,
  ROUND(SUM(pf.overs_bowled), 1) AS total_overs,
  COUNT(pf.match_id) AS matches
FROM Player p
INNER JOIN Team t ON p.team_id = t.team_id
INNER JOIN Performance pf ON p.player_id = pf.player_id
WHERE pf.wickets_taken > 0 OR pf.overs_bowled > 0
GROUP BY p.player_id, p.player_name, t.team_name
ORDER BY total_wickets DESC
LIMIT 5;`,
  },
  {
    name: 'DDL: Inspect Database Schema Tables',
    category: 'Schema Inspection',
    description: 'Queries SQLite master catalog for table definitions.',
    sql: `SELECT 
  type, 
  name, 
  tbl_name 
FROM sqlite_master 
WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
ORDER BY name;`,
  },
  {
    name: 'Integrity: Foreign Key Constraints on Player',
    category: 'Integrity Checks',
    description: 'Verifies SQLite Foreign Key reference mapping from Player to Team.',
    sql: `PRAGMA foreign_key_list(Player);`,
  },
  {
    name: 'DML: Insert Test Player (Parameterized Structure)',
    category: 'DML Insert',
    description: 'Demonstrates an INSERT statement into the Player table.',
    sql: `INSERT INTO Player (player_name, role, team_id) 
VALUES ('Test Athlete', 'All-Rounder', 1);`,
  },
];

export const SqlVivaHubView: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'sql' | 'schema'>('sql');

  // SQL Runner state
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<SqlExecutionResult | null>(null);
  const [databaseHealth, setDatabaseHealth] = useState<{
    engine: string;
    foreignKeys: boolean;
    tables: string[];
    counts: { teams: number; players: number; matches: number };
  } | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    api.getDatabaseHealth()
      .then((health) => setDatabaseHealth(health))
      .catch(() => setHealthError(true));
  }, []);

  const handleRunQuery = async () => {
    if (!sqlQuery.trim()) return;
    setIsRunning(true);
    setResult(null);
    try {
      const res = await api.executeSql(sqlQuery.trim());
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || 'Execution error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-500 tracking-wide uppercase font-mono">
            <Database className="w-4 h-4" />
            <span>Relational SQL Studio</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            SQL Playground & Database Schema
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Execute live SQL queries on SQLite and inspect normalized table structures, primary keys, and foreign key relationships.
          </p>
        </div>

        {/* Tab Selector */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? isDark
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white text-slate-900 shadow-sm font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>SQL Playground</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? isDark
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white text-slate-900 shadow-sm font-bold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Schema & Tables</span>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-4 gap-px border overflow-hidden rounded-2xl ${
        isDark ? 'bg-amber-500/20 border-amber-500/20' : 'bg-slate-200 border-slate-200'
      }`}>
        <div className={`p-4 ${isDark ? 'bg-slate-950/90' : 'bg-white'}`}>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Database engine</div>
          <div className="mt-1 text-sm font-bold text-amber-500">{databaseHealth?.engine ?? 'Checking…'}</div>
        </div>
        <div className={`p-4 ${isDark ? 'bg-slate-950/90' : 'bg-white'}`}>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Foreign keys</div>
          <div className={`mt-1 text-sm font-bold ${databaseHealth?.foreignKeys ? 'text-emerald-500' : healthError ? 'text-red-400' : 'text-slate-400'}`}>
            {databaseHealth?.foreignKeys ? 'ENFORCED' : healthError ? 'OFFLINE' : 'CHECKING'}
          </div>
        </div>
        <div className={`p-4 ${isDark ? 'bg-slate-950/90' : 'bg-white'}`}>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Normalized tables</div>
          <div className="mt-1 text-sm font-bold text-white">{databaseHealth?.tables.length ?? '—'} <span className="text-xs font-normal text-slate-500">entities</span></div>
        </div>
        <div className={`p-4 ${isDark ? 'bg-slate-950/90' : 'bg-white'}`}>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Live records</div>
          <div className="mt-1 text-sm font-bold text-white">
            {databaseHealth ? databaseHealth.counts.teams + databaseHealth.counts.players + databaseHealth.counts.matches : '—'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: INTERACTIVE SQL PLAYGROUND */}
      {/* ======================================================== */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          {/* Preset queries selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Preset Demonstration Queries
              </span>
              <span className="text-[11px] text-slate-500">
                Click any query preset to load into editor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PRESET_QUERIES.map((q) => (
                <button
                  key={q.name}
                  onClick={() => setSqlQuery(q.sql)}
                  className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer ${
                    sqlQuery === q.sql
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 truncate">{q.name}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{q.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>SQLite Query Editor (PRAGMA foreign_keys = ON)</span>
              </div>
              <button
                onClick={handleRunQuery}
                disabled={isRunning}
                className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Executing...' : 'Run SQL Query'}</span>
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={8}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs text-emerald-300 bg-slate-900 focus:outline-none resize-y leading-relaxed"
              placeholder="Enter SQL statements (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, PRAGMA)..."
            />
          </div>

          {/* Query Output Result */}
          {result && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
              <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs font-bold text-slate-900">
                    {result.success ? 'Query Executed Successfully' : 'Query Execution Error'}
                  </span>
                  {result.type && (
                    <span className="text-xs font-mono font-semibold text-emerald-700 ml-2">
                      [{result.type}]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  {result.executionTimeMs !== undefined && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{result.executionTimeMs} ms</span>
                    </span>
                  )}
                  {result.rowCount !== undefined && (
                    <span>· {result.rowCount} rows returned</span>
                  )}
                  {result.changes !== undefined && (
                    <span>· {result.changes} rows modified</span>
                  )}
                </div>
              </div>

              {result.error ? (
                <div className="p-5 font-mono text-xs text-red-700 bg-red-50/50">
                  {result.error}
                </div>
              ) : result.rows && result.rows.length > 0 ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0">
                      <tr>
                        {result.columns?.map((col) => (
                          <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {result.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/75">
                          {result.columns?.map((col) => (
                            <td key={col} className="py-2 px-3 whitespace-nowrap tabular-nums">
                              {row[col] !== null && row[col] !== undefined
                                ? String(row[col])
                                : <span className="text-slate-400 italic">NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : result.rows && result.rows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Query returned 0 matching records.
                </div>
              ) : (
                <div className="p-5 text-xs text-slate-600 font-mono">
                  Operation completed. Rows affected: {result.changes ?? 0}
                  {result.lastInsertRowid ? ` (Last Insert ID: ${result.lastInsertRowid})` : ''}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SCHEMA & TABLE RELATIONSHIPS */}
      {/* ======================================================== */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Database Schema & 5 Core Normalized Tables (3NF)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Relational schema with Primary Keys (PK), Foreign Keys (FK), and domain CHECK constraints.
              </p>
            </div>

            {/* Visual Tables Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {/* 1. Team Table Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-emerald-800 text-white flex items-center justify-between">
                  <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Team</span>
                  </div>
                  <span className="text-[10px] text-emerald-200 font-mono">Core Entity</span>
                </div>
                <div className="p-3 divide-y divide-slate-100 font-mono text-xs bg-white">
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-emerald-800">team_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (PK, AUTO)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">team_name</span>
                    <span className="text-slate-400 text-[11px]">TEXT (UNIQUE, NOT NULL)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">country</span>
                    <span className="text-slate-400 text-[11px]">TEXT (NOT NULL)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-400">created_at</span>
                    <span className="text-slate-400 text-[11px]">DATETIME</span>
                  </div>
                </div>
              </div>

              {/* 2. Player Table Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-blue-800 text-white flex items-center justify-between">
                  <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Player</span>
                  </div>
                  <span className="text-[10px] text-blue-200 font-mono">FK: Team</span>
                </div>
                <div className="p-3 divide-y divide-slate-100 font-mono text-xs bg-white">
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-blue-800">player_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (PK, AUTO)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">player_name</span>
                    <span className="text-slate-400 text-[11px]">TEXT (NOT NULL)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">role</span>
                    <span className="text-slate-400 text-[11px]">TEXT (CHECK role IN (...))</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-emerald-800">team_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Team)</span>
                  </div>
                </div>
              </div>

              {/* 3. Match Table Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-amber-800 text-white flex items-center justify-between">
                  <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Match</span>
                  </div>
                  <span className="text-[10px] text-amber-200 font-mono">FK: Team</span>
                </div>
                <div className="p-3 divide-y divide-slate-100 font-mono text-xs bg-white">
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-amber-800">match_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (PK, AUTO)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-emerald-800">team1_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Team)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-emerald-800">team2_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Team)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">match_date</span>
                    <span className="text-slate-400 text-[11px]">TEXT</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">venue</span>
                    <span className="text-slate-400 text-[11px]">TEXT</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">status</span>
                    <span className="text-slate-400 text-[11px]">TEXT (CHECK status)</span>
                  </div>
                </div>
              </div>

              {/* 4. Score Table Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-purple-800 text-white flex items-center justify-between">
                  <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Score</span>
                  </div>
                  <span className="text-[10px] text-purple-200 font-mono">UNIQUE(match, team)</span>
                </div>
                <div className="p-3 divide-y divide-slate-100 font-mono text-xs bg-white">
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-purple-800">score_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (PK, AUTO)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-amber-800">match_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Match)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-emerald-800">team_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Team)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">runs</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (&ge; 0)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">wickets</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (0-10)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">overs</span>
                    <span className="text-slate-400 text-[11px]">REAL (0.0-50.0)</span>
                  </div>
                </div>
              </div>

              {/* 5. Performance Table Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-rose-800 text-white flex items-center justify-between">
                  <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Performance</span>
                  </div>
                  <span className="text-[10px] text-rose-200 font-mono">UNIQUE(match, player)</span>
                </div>
                <div className="p-3 divide-y divide-slate-100 font-mono text-xs bg-white">
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-rose-800">performance_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (PK, AUTO)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-amber-800">match_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Match)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="font-bold text-blue-800">player_id</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (FK &rarr; Player)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">runs_scored</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (&ge; 0)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">wickets_taken</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (0-10)</span>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-800">balls_faced</span>
                    <span className="text-slate-400 text-[11px]">INTEGER (&ge; 0)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Relational Constraints Explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2 mt-4">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Relational Schema Notation (Primary Keys Underlined)</span>
              </div>
              <ul className="space-y-1 text-slate-700">
                <li>&bull; <strong className="text-emerald-800">Team</strong> (<u>team_id</u>, team_name, country, created_at)</li>
                <li>&bull; <strong className="text-blue-800">Player</strong> (<u>player_id</u>, player_name, role, team_id) &rarr; team_id references Team(team_id) ON DELETE CASCADE</li>
                <li>&bull; <strong className="text-amber-800">Match</strong> (<u>match_id</u>, team1_id, team2_id, match_date, venue, status) &rarr; team1_id, team2_id reference Team(team_id)</li>
                <li>&bull; <strong className="text-purple-800">Score</strong> (<u>score_id</u>, match_id, team_id, runs, wickets, overs) &rarr; match_id references Match, team_id references Team</li>
                <li>&bull; <strong className="text-rose-800">Performance</strong> (<u>performance_id</u>, match_id, player_id, runs_scored, wickets_taken, balls_faced, overs_bowled)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
