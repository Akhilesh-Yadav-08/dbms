import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Play,
  Pause,
  RotateCw,
  Radio,
  Database,
  Zap,
} from 'lucide-react';
import { Score, Match } from '../types/cricket';
import { api } from '../lib/api';

interface ScoresViewProps {
  matches: Match[];
  initialMatchId?: number | null;
  onClearInitialMatch?: () => void;
  onRefreshAll: () => void;
}

export const ScoresView: React.FC<ScoresViewProps> = ({
  matches,
  initialMatchId,
  onClearInitialMatch,
  onRefreshAll,
}) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Manual Score Entry
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    initialMatchId ? initialMatchId.toString() : matches.length > 0 ? matches[0].match_id.toString() : ''
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [runs, setRuns] = useState<string>('0');
  const [wickets, setWickets] = useState<string>('0');
  const [overs, setOvers] = useState<string>('0.0');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Auto-Score Simulator State
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [liveBalls, setLiveBalls] = useState<any[]>([]);
  const [isBowling, setIsBowling] = useState(false);
  const simIntervalRef = useRef<any>(null);

  // Selected Match details
  const activeMatch = matches.find((m) => m.match_id.toString() === selectedMatchId);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const data = await api.getScores();
      setScores(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveBalls = async (mId: number) => {
    try {
      const balls = await api.getLiveBalls(mId);
      setLiveBalls(balls);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      fetchLiveBalls(parseInt(selectedMatchId, 10));
    }
  }, [selectedMatchId]);

  useEffect(() => {
    if (initialMatchId) {
      setSelectedMatchId(initialMatchId.toString());
    }
  }, [initialMatchId]);

  useEffect(() => {
    if (activeMatch) {
      if (
        selectedTeamId !== activeMatch.team1_id.toString() &&
        selectedTeamId !== activeMatch.team2_id.toString()
      ) {
        setSelectedTeamId(activeMatch.team1_id.toString());
      }

      const existing = scores.find(
        (s) => s.match_id === activeMatch.match_id && s.team_id.toString() === selectedTeamId
      );
      if (existing) {
        setRuns(existing.runs.toString());
        setWickets(existing.wickets.toString());
        setOvers(existing.overs.toString());
      }
    }
  }, [selectedMatchId, selectedTeamId, activeMatch, scores]);

  // Live Simulator single-ball trigger
  const handleBowlBall = async () => {
    if (!selectedMatchId || isBowling) return;
    setIsBowling(true);
    try {
      const mId = parseInt(selectedMatchId, 10);
      const res = await api.simulateBall(mId);
      if (res.success && res.ball) {
        setLiveBalls((prev) => [res.ball, ...prev.slice(0, 15)]);
        await fetchScores();
        onRefreshAll();
      }
      if (res.completed) {
        setIsAutoSimulating(false);
      }
    } catch (err: any) {
      console.error('Ball simulation error:', err);
    } finally {
      setIsBowling(false);
    }
  };

  // Auto-simulation interval
  useEffect(() => {
    if (isAutoSimulating) {
      simIntervalRef.current = setInterval(() => {
        handleBowlBall();
      }, 2500);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [isAutoSimulating, selectedMatchId]);

  const handleMatchChange = (mId: string) => {
    setIsAutoSimulating(false);
    setSelectedMatchId(mId);
    if (onClearInitialMatch) onClearInitialMatch();
    const m = matches.find((item) => item.match_id.toString() === mId);
    if (m) {
      setSelectedTeamId(m.team1_id.toString());
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId || !selectedTeamId) {
      setErrorMsg('Please select a match and a participating team.');
      return;
    }

    const r = parseInt(runs, 10);
    const w = parseInt(wickets, 10);
    const o = parseFloat(overs);

    if (isNaN(r) || r < 0) {
      setErrorMsg('Runs must be a non-negative integer.');
      return;
    }
    if (isNaN(w) || w < 0 || w > 10) {
      setErrorMsg('Wickets must be between 0 and 10 (database CHECK constraint).');
      return;
    }
    if (isNaN(o) || o < 0 || o > 50) {
      setErrorMsg('Overs must be between 0.0 and 50.0 (database CHECK constraint).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.saveScore({
        match_id: parseInt(selectedMatchId, 10),
        team_id: parseInt(selectedTeamId, 10),
        runs: r,
        wickets: w,
        overs: o,
      });
      setSuccessMsg('Innings score successfully recorded in database!');
      fetchScores();
      onRefreshAll();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScore = async (scoreId: number) => {
    if (!confirm('Are you sure you want to delete this score record?')) return;
    try {
      await api.deleteScore(scoreId);
      fetchScores();
      onRefreshAll();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const calculatedRunRate = () => {
    const r = parseFloat(runs);
    const o = parseFloat(overs);
    if (!o || o <= 0) return '0.00';
    return (r / o).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 tracking-wide uppercase">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Live Score Engine & Database Sync</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Scorecard Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Table: <code className="text-emerald-700 font-mono font-semibold">Score (score_id, match_id FK, team_id FK, runs, wickets, overs)</code>
          </p>
        </div>

        {/* Match Selector for Scoring */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Active Match:</span>
          <select
            value={selectedMatchId}
            onChange={(e) => handleMatchChange(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
          >
            {matches.map((m) => (
              <option key={m.match_id} value={m.match_id}>
                #{m.match_id}: {m.team1_name} vs {m.team2_name} ({m.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIVE BALL-BY-BALL SIMULATOR & REAL-TIME AUTO-SCORER WIDGET */}
      {activeMatch && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 text-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE DATABASE AUTO-SCORER</span>
                <span>·</span>
                <span>Match #{activeMatch.match_id}: {activeMatch.team1_name} vs {activeMatch.team2_name}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Simulate Live Match & Update Scores on Time
              </h2>
              <p className="text-xs text-slate-400 max-w-2xl">
                Every ball bowled triggers a real parameterized SQL <code className="text-emerald-400 font-mono">UPDATE Score SET runs = ..., wickets = ..., overs = ...</code> statement in the database and logs player performances.
              </p>
            </div>

            {/* Live Control Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleBowlBall}
                disabled={isBowling}
                className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isBowling ? 'animate-spin' : ''}`} />
                <span>Bowl Next Ball</span>
              </button>

              <button
                onClick={() => setIsAutoSimulating(!isAutoSimulating)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                  isAutoSimulating
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isAutoSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Live Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Auto-Sync (Every 2.5s)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Live Match Scorecard Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">1st Innings</span>
                <div className="text-sm font-bold text-white mt-0.5">{activeMatch.team1_name}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  {activeMatch.team1_runs != null ? `${activeMatch.team1_runs}/${activeMatch.team1_wickets}` : '0/0'}
                </div>
                <div className="text-xs font-mono text-slate-400 tabular-nums">
                  {activeMatch.team1_overs != null ? activeMatch.team1_overs.toFixed(1) : '0.0'} ov
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">2nd Innings</span>
                <div className="text-sm font-bold text-white mt-0.5">{activeMatch.team2_name}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  {activeMatch.team2_runs != null ? `${activeMatch.team2_runs}/${activeMatch.team2_wickets}` : '0/0'}
                </div>
                <div className="text-xs font-mono text-slate-400 tabular-nums">
                  {activeMatch.team2_overs != null ? activeMatch.team2_overs.toFixed(1) : '0.0'} ov
                </div>
              </div>
            </div>
          </div>

          {/* Recent Balls Strip */}
          {liveBalls.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Recent Balls in Over:</span>
                <span className="text-[11px] text-emerald-400">Live Over Timeline</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {liveBalls.slice(0, 10).map((b) => (
                  <div
                    key={b.id}
                    className={`w-9 h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                      b.isWicket
                        ? 'bg-red-600 text-white border-red-500 shadow-xs'
                        : b.runs === 6
                        ? 'bg-purple-600 text-white border-purple-500'
                        : b.runs === 4
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : b.runs > 0
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {b.isWicket ? 'W' : b.runs === 0 ? '•' : b.runs}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Commentary & Executed SQL Query Log */}
          {liveBalls.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Database className="w-3.5 h-3.5" />
                  <span>Executed SQL Query on Database</span>
                </span>
                <span>{liveBalls[0].timestamp}</span>
              </div>
              <div className="font-mono text-xs text-emerald-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto">
                <code>{liveBalls[0].executedSql};</code>
              </div>
              <div className="text-xs text-slate-300 font-sans flex items-center gap-2">
                <span className="text-slate-500 font-mono">{liveBalls[0].over}</span>
                <span>{liveBalls[0].commentary}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL SCORE ENTRY & RECORDED SCORES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Entry / Update Form */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Manual Innings Override</h2>
          </div>

          <p className="text-xs text-slate-400">
            Manually enter or edit innings runs, wickets, and overs with composite <code className="font-mono text-emerald-400">UNIQUE(match_id, team_id)</code> validation.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleScoreSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Fixture <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => handleMatchChange(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                required
              >
                <option value="" disabled>Choose match</option>
                {matches.map((m) => (
                  <option key={m.match_id} value={m.match_id}>
                    Match #{m.match_id}: {m.team1_name} vs {m.team2_name} ({m.match_date})
                  </option>
                ))}
              </select>
            </div>

            {activeMatch && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Batting Team <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                >
                  <option value={activeMatch.team1_id}>
                    Team 1: {activeMatch.team1_name} ({activeMatch.team1_country})
                  </option>
                  <option value={activeMatch.team2_id}>
                    Team 2: {activeMatch.team2_name} ({activeMatch.team2_country})
                  </option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Runs <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={runs}
                  onChange={(e) => setRuns(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Wickets <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={wickets}
                  onChange={(e) => setWickets(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Overs <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  required
                  value={overs}
                  onChange={(e) => setOvers(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Computed Run Rate */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Computed Run Rate</span>
              </span>
              <span className="text-sm font-black font-mono text-emerald-400 tabular-nums">
                {calculatedRunRate()} <span className="text-[11px] font-normal text-slate-500">RPO</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !activeMatch}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Saving to Database...' : 'Save Manual Scorecard'}
            </button>
          </form>
        </div>

        {/* Recorded Scores Table */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recorded Match Innings Scores</h3>
                <p className="text-xs text-slate-400 font-mono">Query joining Score, Team, and Match tables</p>
              </div>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {scores.length} entries
              </span>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-950/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No innings score records recorded yet. Select a match to enter scores.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-mono">Score ID</th>
                      <th className="py-3 px-4">Match Date</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4 text-right font-mono">Score (R/W)</th>
                      <th className="py-3 px-4 text-right font-mono">Overs</th>
                      <th className="py-3 px-4 text-right font-mono">Run Rate</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {scores.map((s) => {
                      const rpo = s.overs > 0 ? (s.runs / s.overs).toFixed(2) : '0.00';
                      return (
                        <tr key={s.score_id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500 font-medium">
                            #{s.score_id}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {s.match_date}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {s.team_name} <span className="text-slate-500 font-normal font-mono">({s.country})</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-amber-400 tabular-nums text-sm">
                            {s.runs}/{s.wickets}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                            {s.overs.toFixed(1)} ov
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                            {rpo}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteScore(s.score_id)}
                              title="Delete Score"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-500 font-mono">
            Every scorecard is linked to its fixture and competing squad for accurate live coverage.
          </div>
        </div>
      </div>
    </div>
  );
};
