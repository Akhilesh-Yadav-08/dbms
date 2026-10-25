import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Plus, Trash2, AlertCircle, CheckCircle2, Zap, Filter, Flame } from 'lucide-react';
import { Performance, Match, Player } from '../types/cricket';
import { api } from '../lib/api';

interface PerformancesViewProps {
  matches: Match[];
  initialMatchId?: number | null;
  onClearInitialMatch?: () => void;
  onRefreshAll: () => void;
}

export const PerformancesView: React.FC<PerformancesViewProps> = ({
  matches,
  initialMatchId,
  onClearInitialMatch,
  onRefreshAll,
}) => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    initialMatchId ? initialMatchId.toString() : matches.length > 0 ? matches[0].match_id.toString() : ''
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [runsScored, setRunsScored] = useState<string>('0');
  const [ballsFaced, setBallsFaced] = useState<string>('0');
  const [wicketsTaken, setWicketsTaken] = useState<string>('0');
  const [oversBowled, setOversBowled] = useState<string>('0.0');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state for the table
  const [filterMatchId, setFilterMatchId] = useState<string>('');

  const activeMatch = matches.find((m) => m.match_id.toString() === selectedMatchId);

  // Filter players that belong to either team1 or team2 of selected match
  const matchEligiblePlayers = allPlayers.filter((p) => {
    if (!activeMatch) return false;
    return p.team_id === activeMatch.team1_id || p.team_id === activeMatch.team2_id;
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfData, playerData] = await Promise.all([
        api.getPerformances({ match_id: filterMatchId ? parseInt(filterMatchId, 10) : undefined }),
        api.getPlayers(),
      ]);
      setPerformances(perfData);
      setAllPlayers(playerData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMatchId]);

  useEffect(() => {
    if (initialMatchId) {
      setSelectedMatchId(initialMatchId.toString());
      setFilterMatchId(initialMatchId.toString());
    }
  }, [initialMatchId]);

  useEffect(() => {
    if (matchEligiblePlayers.length > 0 && !selectedPlayerId) {
      setSelectedPlayerId(matchEligiblePlayers[0].player_id.toString());
    }
  }, [matchEligiblePlayers, selectedPlayerId]);

  const handleMatchSelect = (mId: string) => {
    setSelectedMatchId(mId);
    setSelectedPlayerId('');
    if (onClearInitialMatch) onClearInitialMatch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId || !selectedPlayerId) {
      setErrorMsg('Please select both a match and an eligible player.');
      return;
    }

    const runs = parseInt(runsScored, 10);
    const balls = parseInt(ballsFaced, 10);
    const wickets = parseInt(wicketsTaken, 10);
    const overs = parseFloat(oversBowled);

    if (isNaN(runs) || runs < 0) {
      setErrorMsg('Runs scored must be >= 0.');
      return;
    }
    if (isNaN(wickets) || wickets < 0 || wickets > 10) {
      setErrorMsg('Wickets taken must be between 0 and 10.');
      return;
    }
    if (isNaN(balls) || balls < 0) {
      setErrorMsg('Balls faced must be >= 0.');
      return;
    }
    if (isNaN(overs) || overs < 0) {
      setErrorMsg('Overs bowled must be >= 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.savePerformance({
        match_id: parseInt(selectedMatchId, 10),
        player_id: parseInt(selectedPlayerId, 10),
        runs_scored: runs,
        balls_faced: balls,
        wickets_taken: wickets,
        overs_bowled: overs,
      });
      setSuccessMsg('Player match performance successfully recorded to SQLite!');
      fetchData();
      onRefreshAll();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save performance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this player performance entry?')) return;
    try {
      await api.deletePerformance(id);
      fetchData();
      onRefreshAll();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Batting Strike Rate
  const strikeRate = () => {
    const r = parseFloat(runsScored);
    const b = parseFloat(ballsFaced);
    if (!b || b <= 0) return '0.0';
    return ((r / b) * 100).toFixed(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
              Junction Table: Performance
            </span>
            <span className="text-slate-500 text-xs font-mono">Many-to-Many Bridge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Player Match Performances
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logs individual innings contributions. Enforces composite constraint <code className="text-emerald-400 font-mono">UNIQUE(match_id, player_id)</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Log Player Figures</h2>
              <p className="text-[11px] text-slate-400">Direct parameter SQL insert/upsert</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Fixture <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedMatchId}
                onChange={(e) => handleMatchSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 text-slate-200"
                required
              >
                <option value="" disabled>Choose match</option>
                {matches.map((m) => (
                  <option key={m.match_id} value={m.match_id}>
                    Match #{m.match_id}: {m.team1_name} vs {m.team2_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Participating Player <span className="text-red-400">*</span>
              </label>
              <select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 text-slate-200"
                required
              >
                <option value="" disabled>Select player</option>
                {matchEligiblePlayers.map((p) => (
                  <option key={p.player_id} value={p.player_id}>
                    {p.player_name} ({p.role} · {p.team_name})
                  </option>
                ))}
              </select>
              {matchEligiblePlayers.length === 0 && (
                <span className="text-[11px] text-amber-400/80 block mt-1">
                  No players found in the participating teams. Add players first.
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Runs Scored
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={runsScored}
                  onChange={(e) => setRunsScored(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Balls Faced
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={ballsFaced}
                  onChange={(e) => setBallsFaced(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Wickets Taken
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  required
                  value={wicketsTaken}
                  onChange={(e) => setWicketsTaken(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-400 text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Overs Bowled
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={oversBowled}
                  onChange={(e) => setOversBowled(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 text-slate-300"
                />
              </div>
            </div>

            {/* Live Batting Strike Rate Metric */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Calculated Strike Rate</span>
              </span>
              <span className="font-bold font-mono text-amber-300 tabular-nums">
                {strikeRate()} <span className="font-normal text-slate-500">SR</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || matchEligiblePlayers.length === 0}
              className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {isSubmitting ? 'Recording...' : 'Save Player Performance'}
            </button>
          </form>
        </div>

        {/* Table of Performance Records */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Recorded Performance Logs</span>
                </h3>
                <p className="text-xs text-slate-400">Relational Join across Performance, Player, Team, and Match</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterMatchId}
                  onChange={(e) => setFilterMatchId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="">All Matches</option>
                  {matches.map((m) => (
                    <option key={m.match_id} value={m.match_id}>
                      Match #{m.match_id}: {m.team1_name} vs {m.team2_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : performances.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No player performances found. Select a match to log performance data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Player</th>
                      <th className="py-3.5 px-4">Team</th>
                      <th className="py-3.5 px-4 font-mono">Match</th>
                      <th className="py-3.5 px-4 text-right font-mono">Runs (Balls)</th>
                      <th className="py-3.5 px-4 text-right font-mono">Wickets (Overs)</th>
                      <th className="py-3.5 px-4 text-right font-mono">SR</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {performances.map((p) => {
                      const sr = p.balls_faced > 0 ? ((p.runs_scored / p.balls_faced) * 100).toFixed(1) : '-';
                      return (
                        <tr key={p.performance_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">
                            {p.player_name}
                            <span className="text-[11px] font-normal text-slate-400 block">
                              {p.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {p.team_name}
                          </td>
                          <td className="py-3 px-4 font-mono text-amber-400/80">
                            #{p.match_id}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                            {p.runs_scored}{' '}
                            <span className="text-slate-500 font-normal">({p.balls_faced})</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                            {p.wickets_taken}{' '}
                            <span className="text-slate-500 font-normal">({p.overs_bowled.toFixed(1)} ov)</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                            {sr}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDelete(p.performance_id)}
                              title="Delete record"
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
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

          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 font-mono">
            DBMS Note: Demonstrates many-to-many relationship between Match and Player resolved via the Performance junction entity.
          </div>
        </div>
      </div>
    </motion.div>
  );
};
