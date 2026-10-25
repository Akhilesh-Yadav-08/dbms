import React, { useState } from 'react';
import { Plus, Calendar, MapPin, Edit2, Trash2, AlertCircle, FileText, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { Match, Team, MatchStatus } from '../types/cricket';
import { api } from '../lib/api';

interface MatchesViewProps {
  matches: Match[];
  teams: Team[];
  loading: boolean;
  onRefresh: () => void;
  onViewMatchDetails: (matchId: number) => void;
  onEnterScore: (matchId: number) => void;
  onLogPerformance: (matchId: number) => void;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  teams,
  loading,
  onRefresh,
  onViewMatchDetails,
  onEnterScore,
  onLogPerformance,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Form State
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');
  const [matchDate, setMatchDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState<string>('');
  const [status, setStatus] = useState<MatchStatus>('Scheduled');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingMatch, setDeletingMatch] = useState<Match | null>(null);

  const filteredMatches = matches.filter((m) => {
    if (statusFilter === 'All') return true;
    return m.status === statusFilter;
  });

  const handleOpenAdd = () => {
    setEditingMatch(null);
    if (teams.length >= 2) {
      setTeam1Id(teams[0].team_id.toString());
      setTeam2Id(teams[1].team_id.toString());
    } else {
      setTeam1Id('');
      setTeam2Id('');
    }
    setMatchDate(new Date().toISOString().split('T')[0]);
    setVenue('');
    setStatus('Scheduled');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Match) => {
    setEditingMatch(m);
    setTeam1Id(m.team1_id.toString());
    setTeam2Id(m.team2_id.toString());
    setMatchDate(m.match_date);
    setVenue(m.venue);
    setStatus(m.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team1Id || !team2Id || !matchDate || !venue.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (team1Id === team2Id) {
      setErrorMsg('A team cannot play against itself (team1_id <> team2_id constraint).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (editingMatch) {
        await api.updateMatch(editingMatch.match_id, {
          team1_id: parseInt(team1Id, 10),
          team2_id: parseInt(team2Id, 10),
          match_date: matchDate,
          venue: venue.trim(),
          status,
        });
      } else {
        await api.createMatch({
          team1_id: parseInt(team1Id, 10),
          team2_id: parseInt(team2Id, 10),
          match_date: matchDate,
          venue: venue.trim(),
          status,
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save fixture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMatch) return;
    try {
      await api.deleteMatch(deletingMatch.match_id);
      setDeletingMatch(null);
      onRefresh();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Matches & Fixtures</h1>
          <p className="text-xs text-slate-400 mt-1">
            Table: <code className="text-emerald-400 font-mono font-semibold">Match (match_id, team1_id FK, team2_id FK, venue, match_date, status)</code>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Match</span>
        </motion.button>
      </div>

      {/* Status Segmented Control */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {['All', 'Scheduled', 'In Progress', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400 tabular-nums">
          {filteredMatches.length} matches displayed
        </div>
      </div>

      {/* Matches List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No matches found for this filter</h3>
          <p className="text-xs text-slate-500">Schedule a new tournament match or select another status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.map((m, idx) => {
            const hasScore = m.team1_runs !== null || m.team2_runs !== null;
            const isLive = m.status === 'In Progress';
            return (
              <motion.div
                key={m.match_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                className={`bg-slate-900/80 backdrop-blur-sm rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isLive ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{m.match_date}</span>
                      <span>·</span>
                      <span>Fixture #{m.match_id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                          m.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : m.status === 'In Progress'
                            ? 'bg-amber-950 text-amber-300 border-amber-800/60 flex items-center gap-1.5'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                        {m.status}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Match"
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingMatch(m)}
                        title="Delete Match"
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-md cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Team vs Team Cards */}
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{m.team1_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Team 1 · {m.team1_country}</div>
                      </div>
                      <div className="text-right">
                        {m.team1_runs !== null ? (
                          <div className="text-base font-black font-mono tabular-nums text-white">
                            {m.team1_runs}/{m.team1_wickets}
                            <span className="text-xs font-normal text-slate-400 ml-1 font-sans">
                              ({m.team1_overs} ov)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Yet to bat</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{m.team2_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Team 2 · {m.team2_country}</div>
                      </div>
                      <div className="text-right">
                        {m.team2_runs !== null ? (
                          <div className="text-base font-black font-mono tabular-nums text-white">
                            {m.team2_runs}/{m.team2_wickets}
                            <span className="text-xs font-normal text-slate-400 ml-1 font-sans">
                              ({m.team2_overs} ov)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Yet to bat</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{m.venue}</span>
                  </div>
                </div>

                {/* Match Action Bar */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEnterScore(m.match_id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        isLive
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>{isLive ? 'Live Ball-by-Ball' : hasScore ? 'Update Scores' : 'Enter Scores'}</span>
                    </button>

                    <button
                      onClick={() => onLogPerformance(m.match_id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Log Performance
                    </button>
                  </div>

                  <button
                    onClick={() => onViewMatchDetails(m.match_id)}
                    className="px-3 py-1.5 text-xs font-bold text-white hover:text-emerald-400 cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Scorecard</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Match Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-800"
          >
            <h3 className="text-base font-bold text-white">
              {editingMatch ? 'Edit Match Fixture' : 'Schedule New Match'}
            </h3>
            <p className="text-xs text-slate-400">
              Creates records in <code className="font-mono text-emerald-400">Match</code> with constraints enforcing <code className="font-mono text-emerald-400">team1_id &lt;&gt; team2_id</code>.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Team 1 (Home) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={team1Id}
                    onChange={(e) => setTeam1Id(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="" disabled>Select Team 1</option>
                    {teams.map((t) => (
                      <option key={t.team_id} value={t.team_id}>
                        {t.team_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Team 2 (Away) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={team2Id}
                    onChange={(e) => setTeam2Id(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  >
                    <option value="" disabled>Select Team 2</option>
                    {teams.map((t) => (
                      <option key={t.team_id} value={t.team_id}>
                        {t.team_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Match Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Match Status (CHECK constraint) <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MatchStatus)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Stadium Venue & City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Melbourne Cricket Ground, Melbourne"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-xl cursor-pointer transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingMatch ? 'Update Match' : 'Schedule Match'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Match Modal */}
      {deletingMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-800"
          >
            <h3 className="text-base font-bold text-white">
              Delete Match #{deletingMatch.match_id}?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deleting this fixture will automatically remove all recorded innings scores and individual player performances associated with this match via <code className="font-mono text-red-400">ON DELETE CASCADE</code>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMatch(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
