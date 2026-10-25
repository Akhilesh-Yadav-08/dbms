import React, { useRef } from 'react';
import {
  Users,
  Shield,
  Calendar,
  Activity,
  Flame,
  ArrowRight,
  Database,
  Award,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ChampionshipHero } from './ChampionshipHero';
import { CricketGoatsSection } from './CricketGoatsSection';
import { DashboardStats, Match } from '../types/cricket';
import { useTheme } from '../context/ThemeContext';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: string) => void;
  onViewMatch: (matchId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onNavigate,
  onViewMatch,
}) => {
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const handleScrollToContent = () => {
    contentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-96 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const maxRuns = stats.topScorers.length > 0 ? stats.topScorers[0].total_runs : 1;
  const maxWickets = stats.topBowlers.length > 0 ? stats.topBowlers[0].total_wickets : 1;

  return (
    <div className="space-y-12">
      {/* ============================================================ */}
      {/* 1. CHAMPIONSHIP HERO ARENA WITH 3D ROTATING TROPHY           */}
      {/* ============================================================ */}
      <ChampionshipHero
        onScrollToContent={handleScrollToContent}
        onNavigate={onNavigate}
      />

      {/* ============================================================ */}
      {/* 2. MAIN TOURNAMENT DASHBOARD CONTENT                         */}
      {/* ============================================================ */}
      <div
        ref={contentSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 z-10 relative"
      >
        {/* KPI 4-Column Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className={`p-5 sm:p-6 rounded-2xl border shadow-md transition-all ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40'
                : 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Tournament Teams
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div
              className={`text-3xl font-black font-mono tabular-nums mt-3 ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {stats.totalTeams}
            </div>
            <div className="text-xs text-slate-400 mt-1">6 international squads</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className={`p-5 sm:p-6 rounded-2xl border shadow-md transition-all ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 hover:border-blue-500/40'
                : 'bg-white border-slate-200 hover:border-blue-500 shadow-slate-200/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Rostered Athletes
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center border border-blue-500/30">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div
              className={`text-3xl font-black font-mono tabular-nums mt-3 ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {stats.totalPlayers}
            </div>
            <div className="text-xs text-slate-400 mt-1">Across 4 playing roles</div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className={`p-5 sm:p-6 rounded-2xl border shadow-md transition-all ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                : 'bg-white border-slate-200 hover:border-amber-500 shadow-slate-200/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Matches Hosted
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div
              className={`text-3xl font-black font-mono tabular-nums mt-3 ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {stats.totalMatches}
            </div>
            <div className="text-xs text-amber-500 font-mono font-semibold mt-1">
              {stats.completedMatches} fixtures completed
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className={`p-5 sm:p-6 rounded-2xl border shadow-md transition-all ${
              isDark
                ? 'bg-slate-950/80 border-slate-800 hover:border-purple-500/40'
                : 'bg-white border-slate-200 hover:border-purple-500 shadow-slate-200/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Tournament Runs
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center border border-purple-500/30">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div
              className={`text-3xl font-black font-mono tabular-nums mt-3 ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {stats.totalRuns}
            </div>
            <div className="text-xs text-purple-500 font-mono mt-1">
              {stats.totalWickets} wickets fallen
            </div>
          </motion.div>
        </div>

        {/* Quick Callout to Full Cricketer Showcase */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md ${
            isDark
              ? 'bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-slate-950/90 border-amber-500/30'
              : 'bg-white border-slate-200 shadow-slate-200/60'
          }`}
        >
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider uppercase text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>Cinematic Campaign Showcase</span>
            </div>
            <h2
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Immersive Editorial Cricketer Showcase
            </h2>
            <p
              className={`text-xs sm:text-sm max-w-xl ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Experience Sachin, Virat, Dhoni, Vivian Richards, and Warne with full-bleed cinematic atmospheres, signature shot reels, and relational SQLite benchmark comparisons.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('goats')}
            className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 rounded-xl shadow-xl shadow-amber-500/25 cursor-pointer shrink-0 inline-flex items-center gap-2"
          >
            <span>Launch Showcase</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Hall of GOATs Grid Preview */}
        <CricketGoatsSection />

        {/* Leaderboards Grid (Top Run Scorers & Leading Wicket Takers) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leading Run Scorers */}
          <div
            className={`rounded-3xl border shadow-md overflow-hidden ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    className={`text-sm font-bold ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    Leading Run Scorers
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    SQL: SUM(runs_scored) & GROUP BY
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('players')}
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/5 p-2">
              {stats.topScorers.map((scorer, idx) => {
                const runPercent = Math.min(100, Math.round((scorer.total_runs / maxRuns) * 100));
                return (
                  <div
                    key={scorer.player_id}
                    className="p-3.5 hover:bg-white/5 rounded-2xl transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-500/40">
                          {idx + 1}
                        </span>
                        <div>
                          <div
                            className={`text-sm font-bold ${
                              isDark ? 'text-white' : 'text-slate-950'
                            }`}
                          >
                            {scorer.player_name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span>{scorer.team_name}</span>
                            <span>·</span>
                            <span className="text-slate-500">{scorer.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-amber-500 font-mono tabular-nums">
                          {scorer.total_runs}{' '}
                          <span className="text-xs font-normal text-slate-400 font-sans">runs</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {scorer.total_balls} balls ({scorer.innings_played} inn)
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800/40 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${runPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leading Wicket Takers */}
          <div
            className={`rounded-3xl border shadow-md overflow-hidden ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    className={`text-sm font-bold ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    Leading Wicket Takers
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    SQL: SUM(wickets_taken) & GROUP BY
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('players')}
                className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/5 p-2">
              {stats.topBowlers.map((bowler, idx) => {
                const wktPercent = Math.min(100, Math.round((bowler.total_wickets / maxWickets) * 100));
                return (
                  <div
                    key={bowler.player_id}
                    className="p-3.5 hover:bg-white/5 rounded-2xl transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                          {idx + 1}
                        </span>
                        <div>
                          <div
                            className={`text-sm font-bold ${
                              isDark ? 'text-white' : 'text-slate-950'
                            }`}
                          >
                            {bowler.player_name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span>{bowler.team_name}</span>
                            <span>·</span>
                            <span className="text-slate-500">{bowler.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-400 font-mono tabular-nums">
                          {bowler.total_wickets}{' '}
                          <span className="text-xs font-normal text-slate-400 font-sans">wickets</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {bowler.total_overs.toFixed(1)} ov ({bowler.matches_played} matches)
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800/40 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${wktPercent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Matches Broadcast Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className={`text-xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Recent Match Center
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Dual INNER JOIN query connecting Match, Teams, and Innings Scores
              </p>
            </div>
            <button
              onClick={() => onNavigate('matches')}
              className="text-xs font-semibold text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>All Fixtures</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.recentMatches.map((match: Match) => {
              const hasScores = match.team1_runs !== null || match.team2_runs !== null;
              const isLive = match.status === 'In Progress';
              return (
                <motion.div
                  key={match.match_id}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xl backdrop-blur-md ${
                    isLive
                      ? 'bg-slate-950/90 border-amber-500/50 shadow-amber-500/10'
                      : isDark
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-amber-500 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/10">
                      <span className="font-mono">{match.match_date}</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] font-mono ${
                          match.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : match.status === 'In Progress'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center gap-1.5'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {match.status === 'In Progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        )}
                        {match.status}
                      </span>
                    </div>

                    <div className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span
                            className={`text-sm font-bold ${
                              isDark ? 'text-white' : 'text-slate-950'
                            }`}
                          >
                            {match.team1_name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-mono font-bold tabular-nums ${
                            isDark ? 'text-white' : 'text-slate-950'
                          }`}
                        >
                          {match.team1_runs !== null ? (
                            <>
                              {match.team1_runs}/{match.team1_wickets}{' '}
                              <span className="text-xs font-normal text-slate-400 font-sans">
                                ({match.team1_overs} ov)
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-normal text-slate-500">Yet to bat</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-blue-500" />
                          <span
                            className={`text-sm font-bold ${
                              isDark ? 'text-white' : 'text-slate-950'
                            }`}
                          >
                            {match.team2_name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-mono font-bold tabular-nums ${
                            isDark ? 'text-white' : 'text-slate-950'
                          }`}
                        >
                          {match.team2_runs !== null ? (
                            <>
                              {match.team2_runs}/{match.team2_wickets}{' '}
                              <span className="text-xs font-normal text-slate-400 font-sans">
                                ({match.team2_overs} ov)
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-normal text-slate-500">Yet to bat</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 truncate pt-2 border-t border-white/10 font-mono">
                      {match.venue}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 flex items-center justify-between border-t border-white/10">
                    <button
                      onClick={() => onViewMatch(match.match_id)}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{hasScores ? 'Full Scorecard' : 'Match Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onNavigate('scores')}
                      className="text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                    >
                      {isLive ? 'Live Ball-by-Ball' : 'Score Entry'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
