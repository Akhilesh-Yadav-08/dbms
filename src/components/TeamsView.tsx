import React, { useState } from 'react';
import { Plus, Search, Shield, Users, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Team } from '../types/cricket';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface TeamsViewProps {
  teams: Team[];
  loading: boolean;
  onRefresh: () => void;
  onViewSquad: (teamId: number) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  loading,
  onRefresh,
  onViewSquad,
}) => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [country, setCountry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const filteredTeams = teams.filter(
    (t) =>
      t.team_name.toLowerCase().includes(search.toLowerCase()) ||
      t.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingTeam(null);
    setTeamName('');
    setCountry('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.team_name);
    setCountry(team.country);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !country.trim()) {
      setErrorMsg('Both Team Name and Country are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTeam) {
        await api.updateTeam(editingTeam.team_id, {
          team_name: teamName.trim(),
          country: country.trim(),
        });
      } else {
        await api.createTeam({
          team_name: teamName.trim(),
          country: country.trim(),
        });
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeam) return;
    try {
      await api.deleteTeam(deletingTeam.team_id);
      setDeletingTeam(null);
      onRefresh();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Teams Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Table: <code className="text-emerald-500 font-mono font-semibold">Team (team_id, team_name, country)</code>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Team</span>
        </motion.button>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams by name or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              isDark
                ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500'
                : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
        <div className="text-xs font-mono text-slate-500 tabular-nums">
          {filteredTeams.length} registered squads
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-44 rounded-2xl animate-pulse ${
                isDark ? 'bg-slate-900/50 border border-slate-800' : 'bg-slate-200 border border-slate-300'
              }`}
            />
          ))}
        </div>
      ) : filteredTeams.length === 0 ? (
        <div
          className={`rounded-2xl border p-12 text-center space-y-3 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Shield className="w-10 h-10 text-slate-400 mx-auto" />
          <h3
            className={`text-sm font-semibold ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            No teams found
          </h3>
          <p className="text-xs text-slate-500">Add a new cricket team or adjust your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team, idx) => (
            <motion.div
              key={team.team_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border shadow-sm p-5 transition-all flex flex-col justify-between ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-200/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-slate-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        className={`text-base font-bold leading-snug ${
                          isDark ? 'text-white' : 'text-slate-950'
                        }`}
                      >
                        {team.team_name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{team.country}</span>
                        <span>·</span>
                        <span className="font-mono">ID: #{team.team_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(team)}
                      title="Edit Team"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTeam(team)}
                      title="Delete Team"
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-slate-500">Roster Capacity</span>
                  <span className="font-bold text-emerald-500">{team.player_count} registered athletes</span>
                </div>
              </div>

              <div
                className={`mt-5 pt-4 border-t flex items-center justify-between ${
                  isDark ? 'border-slate-800/80' : 'border-slate-100'
                }`}
              >
                <button
                  onClick={() => onViewSquad(team.team_id)}
                  className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Roster</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">DBMS Primary Key</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h2 className="text-lg font-bold">
              {editingTeam ? 'Edit Team Details' : 'Register New National Team'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {editingTeam ? 'Update record in the Team SQL entity' : 'INSERT INTO Team (team_name, country)'}
            </p>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Team Name (e.g., India, Australia)
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Official Squad Name"
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Country / Board
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country of representation"
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-sm w-full p-6 shadow-2xl border space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">Delete Team?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className={isDark ? 'text-white' : 'text-slate-900'}>{deletingTeam.team_name}</strong>?
              Foreign key constraints will also cascade delete all associated players and scores.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
