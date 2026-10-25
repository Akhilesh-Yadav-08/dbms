import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AtmosphereBackground } from './components/AtmosphereBackground';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TeamsView } from './components/TeamsView';
import { PlayersView } from './components/PlayersView';
import { MatchesView } from './components/MatchesView';
import { ScoresView } from './components/ScoresView';
import { PerformancesView } from './components/PerformancesView';
import { SqlVivaHubView } from './components/SqlVivaHubView';
import { FullBackgroundCricketerShowcase } from './components/FullBackgroundCricketerShowcase';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { DashboardStats, Team, Match } from './types/cricket';
import { api } from './lib/api';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { isDark } = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cross-view deep linking state
  const [initialTeamFilter, setInitialTeamFilter] = useState<number | null>(null);
  const [initialMatchId, setInitialMatchId] = useState<number | null>(null);

  // Match details modal
  const [modalMatchId, setModalMatchId] = useState<number | null>(null);

  // Reset Confirmation Modal & Toast
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchGlobalData = async () => {
    try {
      const [statsData, teamsData, matchesData] = await Promise.all([
        api.getStats(),
        api.getTeams(),
        api.getMatches(),
      ]);
      setStats(statsData);
      setTeams(teamsData);
      setMatches(matchesData);
    } catch (err) {
      console.error('Error loading cricket data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await api.resetDatabase();
      await fetchGlobalData();
      setIsResetConfirmOpen(false);
      showToast('Database reset successfully to academic sample benchmark data.');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Cross-view handlers
  const handleViewSquad = (teamId: number) => {
    setInitialTeamFilter(teamId);
    setCurrentTab('players');
  };

  const handleEnterScore = (matchId: number) => {
    setInitialMatchId(matchId);
    setCurrentTab('scores');
  };

  const handleLogPerformance = (matchId: number) => {
    setInitialMatchId(matchId);
    setCurrentTab('performances');
  };

  const handleViewMatchDetails = (matchId: number) => {
    setModalMatchId(matchId);
  };

  return (
    <div
      className={`relative min-h-screen flex flex-col transition-colors duration-700 selection:bg-amber-400 selection:text-slate-950 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* 1. Cinematic Atmospheric Background (Starfield & Volumetric Clouds / Cyan Sky) */}
      <AtmosphereBackground />
      <StarfieldCanvas />

      {/* 2. Top Broadcast Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'players') setInitialTeamFilter(null);
          if (tab !== 'scores' && tab !== 'performances') setInitialMatchId(null);
        }}
        onResetDb={() => setIsResetConfirmOpen(true)}
      />

      {/* 4. Main Content Viewport with Fluid Page Transition */}
      <main className="relative z-10 flex-1 pb-24 site-content">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              loading={loading}
              onNavigate={(tab) => setCurrentTab(tab)}
              onViewMatch={handleViewMatchDetails}
            />
          )}

          {currentTab === 'goats' && (
            <FullBackgroundCricketerShowcase
              onNavigateToPlayers={() => setCurrentTab('players')}
              onNavigateToViva={() => setCurrentTab('viva')}
            />
          )}

          {currentTab === 'teams' && (
            <TeamsView
              teams={teams}
              loading={loading}
              onRefresh={fetchGlobalData}
              onViewSquad={handleViewSquad}
            />
          )}

          {currentTab === 'players' && (
            <PlayersView
              teams={teams}
              initialTeamFilter={initialTeamFilter}
              onClearInitialFilter={() => setInitialTeamFilter(null)}
            />
          )}

          {currentTab === 'matches' && (
            <MatchesView
              matches={matches}
              teams={teams}
              loading={loading}
              onRefresh={fetchGlobalData}
              onViewMatchDetails={handleViewMatchDetails}
              onEnterScore={handleEnterScore}
              onLogPerformance={handleLogPerformance}
            />
          )}

          {currentTab === 'scores' && (
            <ScoresView
              matches={matches}
              initialMatchId={initialMatchId}
              onClearInitialMatch={() => setInitialMatchId(null)}
              onRefreshAll={fetchGlobalData}
            />
          )}

          {currentTab === 'performances' && (
            <PerformancesView
              matches={matches}
              initialMatchId={initialMatchId}
              onClearInitialMatch={() => setInitialMatchId(null)}
              onRefreshAll={fetchGlobalData}
            />
          )}

          {currentTab === 'viva' && <SqlVivaHubView />}
        </motion.div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2.5 text-xs backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Match Details Full Scorecard Modal */}
      {modalMatchId !== null && (
        <MatchDetailsModal
          matchId={modalMatchId}
          onClose={() => setModalMatchId(null)}
        />
      )}

      {/* Database Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-black">Reset Sample Database?</h3>
                <p className="text-xs text-amber-500 font-mono">Academic DBMS Demonstration</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed opacity-80">
              This will re-initialize all 5 relational tables (<code className="font-mono text-amber-500 font-bold">Team, Player, Match, Score, Performance</code>) with the verified international cricket benchmark dataset (6 national teams, 36+ players, 5 fixtures, and complete scorecards).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetConfirm}
                className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-50 rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
