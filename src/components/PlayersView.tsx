import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Edit2, Trash2, AlertCircle, Shield, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Player, Team, PlayerRole } from '../types/cricket';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface PlayersViewProps {
  teams: Team[];
  initialTeamFilter?: number | null;
  onClearInitialFilter?: () => void;
}

const ROLES: PlayerRole[] = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

export const PlayersView: React.FC<PlayersViewProps> = ({
  teams,
  initialTeamFilter,
  onClearInitialFilter,
}) => {
  const { isDark } = useTheme();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>(initialTeamFilter ? initialTeamFilter.toString() : '');
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<PlayerRole>('Batsman');
  const [playerTeamId, setPlayerTeamId] = useState<number>(teams[0]?.team_id || 0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const teamId = selectedTeam ? parseInt(selectedTeam, 10) : undefined;
      const role = selectedRole || undefined;
      const data = await api.getPlayers({ team_id: teamId, role, search: search.trim() || undefined });
      setPlayers(data);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlayers();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedTeam, selectedRole, search]);

  useEffect(() => {
    if (initialTeamFilter) {
      setSelectedTeam(initialTeamFilter.toString());
    }
  }, [initialTeamFilter]);

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setPlayerRole('Batsman');
    setPlayerTeamId(teams[0]?.team_id || 0);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setPlayerName(player.player_name);
    setPlayerRole(player.role);
    setPlayerTeamId(player.team_id);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('Player name is required.');
      return;
    }
    if (!playerTeamId) {
      setErrorMsg('Please select a valid team.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlayer) {
        await api.updatePlayer(editingPlayer.player_id, {
          player_name: playerName.trim(),
          role: playerRole,
          team_id: playerTeamId,
        });
      } else {
        await api.createPlayer({
          player_name: playerName.trim(),
          role: playerRole,
          team_id: playerTeamId,
        });
      }
      setIsModalOpen(false);
      fetchPlayers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlayer) return;
    try {
      await api.deletePlayer(deletingPlayer.player_id);
      setDeletingPlayer(null);
      fetchPlayers();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Batsman':
        return isDark
          ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
          : 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Bowler':
        return isDark
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
          : 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'All-Rounder':
        return isDark
          ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
          : 'bg-purple-50 text-purple-700 border-purple-300';
      case 'Wicket-Keeper':
        return isDark
          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
          : 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Players Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Table: <code className="text-emerald-500 font-mono font-semibold">Player (player_id, player_name, role, team_id FK)</code>
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Player</span>
        </motion.button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark
                  ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Team Filter Dropdown */}
          <select
            value={selectedTeam}
            onChange={(e) => {
              setSelectedTeam(e.target.value);
              if (onClearInitialFilter) onClearInitialFilter();
            }}
            className={`px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              isDark
                ? 'bg-slate-950 border border-slate-800 text-slate-300'
                : 'bg-slate-50 border border-slate-300 text-slate-800'
            }`}
          >
            <option value="">All Teams</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name} ({t.country})
              </option>
            ))}
          </select>

          {/* Role Filter Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-3.5 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              isDark
                ? 'bg-slate-950 border border-slate-800 text-slate-300'
                : 'bg-slate-50 border border-slate-300 text-slate-800'
            }`}
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {(selectedTeam || selectedRole || search) && (
            <button
              onClick={() => {
                setSelectedTeam('');
                setSelectedRole('');
                setSearch('');
                if (onClearInitialFilter) onClearInitialFilter();
              }}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-slate-500 tabular-nums">
          {players.length} players listed
        </div>
      </div>

      {/* Players High-Density Broadcast Table */}
      <div
        className={`rounded-2xl border shadow-md overflow-hidden ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-12 rounded-xl animate-pulse ${
                  isDark ? 'bg-slate-950/60' : 'bg-slate-100'
                }`}
              />
            ))}
          </div>
        ) : players.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <User className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              No players match the criteria
            </h3>
            <p className="text-xs text-slate-500">Try adjusting your role or team filter, or add a new player.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`font-semibold border-b uppercase tracking-wider text-[11px] ${
                  isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <tr>
                  <th className="py-3.5 px-4 font-mono">ID</th>
                  <th className="py-3.5 px-4">Player Name</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Associated Team</th>
                  <th className="py-3.5 px-4 text-right font-mono">Matches</th>
                  <th className="py-3.5 px-4 text-right font-mono">Career Runs</th>
                  <th className="py-3.5 px-4 text-right font-mono">Career Wickets</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/80 text-slate-300' : 'divide-slate-100 text-slate-700'}`}>
                {players.map((player) => (
                  <tr
                    key={player.player_id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-500 font-medium">
                      #{player.player_id}
                    </td>
                    <td className={`py-3 px-4 font-bold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {player.player_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${getRoleBadgeClass(player.role)}`}>
                        {player.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{player.team_name}</span>
                      <span className="text-slate-400 ml-1.5 font-mono">({player.country})</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {player.matches_played ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-amber-500 tabular-nums text-sm">
                      {player.career_runs ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-500 tabular-nums text-sm">
                      {player.career_wickets ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(player)}
                          title="Edit Player"
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingPlayer(player)}
                          title="Delete Player"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Player Modal */}
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
              {editingPlayer ? 'Edit Player Attributes' : 'Register New Athlete'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {editingPlayer ? 'UPDATE Player SET ...' : 'INSERT INTO Player (player_name, role, team_id)'}
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
                  Athlete Name
                </label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Jasprit Bumrah"
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Playing Role
                </label>
                <select
                  value={playerRole}
                  onChange={(e) => setPlayerRole(e.target.value as PlayerRole)}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Assign Team (Foreign Key)
                </label>
                <select
                  value={playerTeamId}
                  onChange={(e) => setPlayerTeamId(parseInt(e.target.value, 10))}
                  className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                >
                  {teams.map((t) => (
                    <option key={t.team_id} value={t.team_id}>
                      {t.team_name} ({t.country})
                    </option>
                  ))}
                </select>
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
                  {isSubmitting ? 'Saving...' : editingPlayer ? 'Update Player' : 'Enroll Athlete'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-2xl max-w-sm w-full p-6 shadow-2xl border space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">Delete Player?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong className={isDark ? 'text-white' : 'text-slate-900'}>{deletingPlayer.player_name}</strong>?
              This will remove player records from the database.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
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
