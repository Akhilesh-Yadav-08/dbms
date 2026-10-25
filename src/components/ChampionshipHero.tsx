import React from 'react';
import { motion } from 'motion/react';
import { ThreeTrophyCanvas } from './ThreeTrophyCanvas';
import { useTheme } from '../context/ThemeContext';
import {
  Trophy,
  ArrowRight,
  Shield,
  Activity,
  Flame,
  ChevronDown,
  Database,
  PlayCircle,
  Sparkles,
} from 'lucide-react';

interface ChampionshipHeroProps {
  onScrollToContent: () => void;
  onNavigate: (tab: string) => void;
}

export const ChampionshipHero: React.FC<ChampionshipHeroProps> = ({
  onScrollToContent,
  onNavigate,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 pt-6 pb-10 z-10 select-none">
      {/* Top Editorial Kicker */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2.5 text-xs font-mono font-bold tracking-widest uppercase"
      >
        <span
          className={`flex items-center gap-1.5 ${
            isDark ? 'text-amber-400' : 'text-amber-600'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>ICC World Championship</span>
        </span>
        <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>·</span>
        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
          Relational 3NF DBMS Platform
        </span>
      </motion.div>

      {/* Main Hero Arena Composition */}
      <div className="relative flex flex-col items-center justify-center my-auto w-full max-w-5xl text-center space-y-6">
        {/* Editorial Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-3 max-w-4xl"
        >
          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] ${
              isDark
                ? 'bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]'
                : 'text-slate-950 drop-shadow-sm'
            }`}
            style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
          >
            CRICKET CHAMPIONSHIP
          </h1>
          <p
            className={`text-sm sm:text-base font-semibold tracking-wide max-w-2xl mx-auto leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Broadcast-grade live scoring, player career metrics, and interactive relational schema queries powered by normalized SQLite.
          </p>
        </motion.div>

        {/* 3D WebGL Cricket Trophy Centerpiece */}
        <div className="relative w-full flex items-center justify-center py-1">
          {/* Concentric Stadium Lighting Stage Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Ambient Spotlight Pool */}
            <div
              className={`w-[480px] sm:w-[620px] h-[360px] rounded-full blur-[100px] transition-colors duration-700 ${
                isDark ? 'bg-amber-500/15' : 'bg-amber-400/20'
              }`}
            />
            {/* Outer Subtle Orbit Ring */}
            <div
              className={`w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full border animate-[spin_70s_linear_infinite] transition-colors duration-700 ${
                isDark ? 'border-amber-500/20' : 'border-amber-600/20'
              }`}
            />
            {/* Inner Dashed Ring */}
            <div
              className={`w-64 sm:w-80 h-64 sm:h-80 rounded-full border border-dashed animate-[spin_50s_linear_infinite_reverse] transition-colors duration-700 ${
                isDark ? 'border-amber-400/25' : 'border-amber-500/25'
              }`}
            />
          </div>

          {/* Real-time 3D Interactive WebGL Canvas */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md sm:max-w-lg"
          >
            <ThreeTrophyCanvas />
          </motion.div>
        </div>

        {/* Strategic CTA Navigation Group */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-3.5 pt-1"
        >
          {/* Primary Action: Live Scorer */}
          <button
            onClick={() => onNavigate('scores')}
            className="group px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <PlayCircle className="w-4 h-4 fill-slate-950/20 group-hover:scale-110 transition-transform" />
            <span>Launch Live Ball Scorer</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action: GOAT Legends */}
          <button
            onClick={() => onNavigate('goats')}
            className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider border shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/40 shadow-black/40'
                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-md'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/30" />
            <span>Legends & GOATs Showcase</span>
          </button>

          {/* Tertiary Action: SQL & Schema Hub */}
          <button
            onClick={() => onNavigate('viva')}
            className={`px-5 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider border shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border-slate-800'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-md'
            }`}
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>SQL Viva & Schema Hub</span>
          </button>
        </motion.div>

        {/* Clean Typographic Metadata Strip (Anti-Slop: No Pill Badges) */}
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-mono pt-2 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>6 International World Cup Squads</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Real-Time Ball Simulator & NRR Math</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>5 Relational Tables in 3NF</span>
          </span>
        </div>
      </div>

      {/* Deliberate Scroll Choreography Cue */}
      <motion.button
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        onClick={onScrollToContent}
        className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity hover:opacity-100 ${
          isDark ? 'text-slate-400 hover:text-amber-400' : 'text-slate-600 hover:text-amber-600'
        }`}
      >
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
          Explore Tournament Standings & Roster
        </span>
        <ChevronDown className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
