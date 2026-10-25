import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Trophy, Shield, Database, Sparkles } from 'lucide-react';
import { Match, Performance } from '../types/cricket';
import { api } from '../lib/api';

interface MatchDetailsModalProps {
  matchId: number;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  matchId,
  onClose,
}) => {
  const [data, setData] = useState<{ match: Match; performances: Performance[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getMatchDetails(matchId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [matchId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-300 font-mono">Executing multi-table relational SQL query...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { match, performances } = data;

  // Calculate Match Result
  const getMatchResult = () => {
    if (match.status !== 'Completed') {
      return match.status === 'In Progress' ? 'Match currently in progress' : 'Fixture scheduled to be played';
    }
    const t1Runs = match.team1_runs ?? 0;
    const t2Runs = match.team2_runs ?? 0;
    if (t1Runs > t2Runs) {
      return `${match.team1_name} won by ${t1Runs - t2Runs} runs`;
    } else if (t2Runs > t1Runs) {
      const remainingWickets = 10 - (match.team2_wickets ?? 0);
      return `${match.team2_name} won by ${remainingWickets} wickets`;
    }
    return 'Match ended in a tie!';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-800 my-8"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                Match #{match.match_id}
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                {match.match_date}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {match.team1_name} <span className="text-amber-400 font-normal">vs</span> {match.team2_name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{match.venue}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Result Banner */}
        <div className="bg-emerald-950/50 text-emerald-200 px-6 py-3.5 text-xs flex items-center gap-2.5 border-b border-emerald-900/40">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white tracking-wide">{getMatchResult()}</span>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Innings Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Team 1 Score Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>{match.team1_name}</span>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                  1st Innings
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                {match.team1_runs != null ? `${match.team1_runs}/${match.team1_wickets ?? 0}` : '-'}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between font-mono tabular-nums pt-1 border-t border-slate-800/60">
                <span>Overs: <strong className="text-white">{match.team1_overs != null ? match.team1_overs.toFixed(1) : '-'}</strong></span>
                <span>
                  RR:{' '}
                  <strong className="text-amber-400">
                    {match.team1_runs != null && match.team1_overs != null && match.team1_overs > 0
                      ? (match.team1_runs / match.team1_overs).toFixed(2)
                      : '-'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Team 2 Score Card */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>{match.team2_name}</span>
                </div>
                <span className="text-[10px] text-blue-400/90 font-mono px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">
                  2nd Innings
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                {match.team2_runs != null ? `${match.team2_runs}/${match.team2_wickets ?? 0}` : '-'}
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between font-mono tabular-nums pt-1 border-t border-slate-800/60">
                <span>Overs: <strong className="text-white">{match.team2_overs != null ? match.team2_overs.toFixed(1) : '-'}</strong></span>
                <span>
                  RR:{' '}
                  <strong className="text-amber-400">
                    {match.team2_runs != null && match.team2_overs != null && match.team2_overs > 0
                      ? (match.team2_runs / match.team2_overs).toFixed(2)
                      : '-'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Individual Match Performances Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Player Match Statistics</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {performances.length} players recorded
              </span>
            </div>

            {performances.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                No individual player batting/bowling figures logged yet for this match.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Player</th>
                      <th className="py-3 px-3.5">Team</th>
                      <th className="py-3 px-3.5">Role</th>
                      <th className="py-3 px-3.5 text-right font-mono">Runs (Balls)</th>
                      <th className="py-3 px-3.5 text-right font-mono">Strike Rate</th>
                      <th className="py-3 px-3.5 text-right font-mono">Wickets (Overs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {performances.map((p) => {
                      const sr = p.balls_faced > 0 ? ((p.runs_scored / p.balls_faced) * 100).toFixed(1) : '-';
                      return (
                        <tr key={p.performance_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3.5 font-semibold text-white">
                            {p.player_name}
                          </td>
                          <td className="py-3 px-3.5 text-slate-300">{p.team_name}</td>
                          <td className="py-3 px-3.5 text-slate-400">{p.role}</td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-white tabular-nums">
                            {p.runs_scored} <span className="font-normal text-slate-500">({p.balls_faced})</span>
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-amber-300 tabular-nums">
                            {sr}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-400 tabular-nums">
                            {p.wickets_taken} <span className="font-normal text-slate-500">({p.overs_bowled.toFixed(1)})</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Academic SQL Query Inspector */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
            <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Behind the Scenes SQL Query (Multi-Table Relational Join)</span>
            </div>
            <pre className="text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`SELECT m.*, t1.team_name, t2.team_name, s1.runs, s2.runs 
FROM Match m 
INNER JOIN Team t1 ON m.team1_id = t1.team_id 
INNER JOIN Team t2 ON m.team2_id = t2.team_id 
LEFT JOIN Score s1 ON m.match_id = s1.match_id AND m.team1_id = s1.team_id 
LEFT JOIN Score s2 ON m.match_id = s2.match_id AND m.team2_id = s2.team_id 
WHERE m.match_id = ${match.match_id};`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl cursor-pointer transition-colors"
          >
            Close Scorecard
          </button>
        </div>
      </motion.div>
    </div>
  );
};
