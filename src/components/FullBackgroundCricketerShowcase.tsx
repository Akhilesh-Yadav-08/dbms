import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CRICKET_GOATS, CricketGoat } from './CricketGoatsSection';
import {
  Trophy,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Activity,
  Award,
  Database,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FullBackgroundCricketerShowcaseProps {
  onNavigateToPlayers: () => void;
  onNavigateToViva: () => void;
}

export const FullBackgroundCricketerShowcase: React.FC<
  FullBackgroundCricketerShowcaseProps
> = ({ onNavigateToPlayers, onNavigateToViva }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const { isDark } = useTheme();

  const currentGoat = CRICKET_GOATS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CRICKET_GOATS.length);
    setCopiedQuery(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CRICKET_GOATS.length) % CRICKET_GOATS.length);
    setCopiedQuery(false);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(currentGoat.dbmsComparisonQuery);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2500);
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-hidden select-none z-10">
      {/* Directional Atmosphere Glow matching player brand accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 -left-12 w-[650px] h-[650px] rounded-full filter blur-[150px] opacity-25 transition-all duration-700 bg-gradient-to-br ${currentGoat.avatarColor}`}
        />
        <div
          className={`absolute bottom-10 right-10 w-[550px] h-[550px] rounded-full filter blur-[130px] transition-colors duration-700 ${
            isDark ? 'bg-amber-500/10' : 'bg-amber-400/15'
          }`}
        />
      </div>

      {/* Top Editorial Bar: Category, Index & Navigation */}
      <div
        className={`relative z-20 flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500/30" />
            <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>
              Campaign Hall of Legends
            </span>
          </div>

          <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>·</span>

          <span
            className={`text-xs font-mono font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {currentIndex + 1} of {CRICKET_GOATS.length} Icons
          </span>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:border-amber-400'
                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-amber-500'
            }`}
            title="Previous Legend (Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700 hover:border-amber-400'
                : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 hover:border-amber-500'
            }`}
            title="Next Legend (Arrow Right)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Campaign Editorial Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGoat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-8"
        >
          {/* Column 1: Editorial Portrait with Layered Cut-Out & Atmospheric Lighting (5 cols) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Rim Spotlight behind portrait */}
            <div
              className={`absolute -inset-2 rounded-3xl blur-2xl opacity-40 transition-colors duration-700 bg-gradient-to-tr ${currentGoat.avatarColor}`}
            />

            {/* Layered Editorial Card with Fine Film Grain & Directional Shadow */}
            <div
              className={`relative w-full max-w-md rounded-3xl overflow-hidden border shadow-2xl transition-all ${
                isDark
                  ? 'bg-slate-950 border-amber-500/30 shadow-black/80'
                  : 'bg-white border-slate-200 shadow-xl'
              }`}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={currentGoat.photo}
                  alt={currentGoat.name}
                  className="w-full h-full object-cover object-top filter contrast-[1.08] saturate-[1.1] transition-transform duration-700 hover:scale-105"
                  loading="eager"
                />

                {/* Subtle directional gradient overlay for legibility */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    isDark
                      ? 'from-slate-950 via-slate-950/40 to-transparent'
                      : 'from-slate-950/80 via-transparent to-transparent'
                  }`}
                />

                {/* In-Photo Editorial Tagging */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20">
                    {currentGoat.category.toUpperCase()} MASTER
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {currentGoat.countryCode}
                  </span>
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    {currentGoat.title}
                  </div>
                  <div
                    className="text-2xl font-black tracking-tight"
                    style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
                  >
                    {currentGoat.name}
                  </div>
                </div>
              </div>

              {/* Bottom Editorial Caption Strip */}
              <div
                className={`p-4 border-t flex items-center justify-between ${
                  isDark
                    ? 'bg-slate-950/90 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="text-xs font-mono">
                  <span className="text-amber-500 font-bold">ERA:</span> {currentGoat.era}
                </div>
                <div className="text-xs font-mono">
                  <span className="text-amber-500 font-bold">MATCHES:</span> {currentGoat.matches}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Biographical Deep-Dive, Feats & Career Radar (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Monumental Typographic Read */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-amber-500 font-bold uppercase tracking-widest">
                  {currentGoat.country}
                </span>
                <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>·</span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                  {currentGoat.iccTrophies} ICC World Trophies
                </span>
              </div>

              <h2
                className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
                style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
              >
                {currentGoat.name}
              </h2>

              <p
                className={`text-base leading-relaxed max-w-2xl ${
                  isDark ? 'text-slate-300' : 'text-slate-700 font-medium'
                }`}
              >
                {currentGoat.bio}
              </p>
            </div>

            {/* Signature Trademark Highlight */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between shadow-md backdrop-blur-md transition-colors ${
                isDark
                  ? 'bg-slate-950/70 border-amber-500/30 text-white'
                  : 'bg-white border-amber-500/40 text-slate-900'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest block">
                  Signature Trademark Shot
                </span>
                <span className="text-sm font-black">{currentGoat.signatureShot}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Zap className="w-5 h-5 fill-amber-500" />
              </div>
            </div>

            {/* Primary High-Impact Numeric Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {currentGoat.statLabel}
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-500 tabular-nums mt-1">
                  {currentGoat.highlightStat}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border shadow-sm ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {currentGoat.secondaryLabel}
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-black font-mono tabular-nums mt-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {currentGoat.secondaryStat}
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border shadow-sm col-span-2 sm:col-span-1 ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider block ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  ICC World Honours
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-500 tabular-nums mt-1">
                  {currentGoat.iccTrophies} Cups
                </div>
              </div>
            </div>

            {/* Defining Feats List */}
            <div className="space-y-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-widest block ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Defining Career Landmarks
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentGoat.legendaryFeats.slice(0, 4).map((feat, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold mt-0.5">
                      ★
                    </span>
                    <span className="leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Relational SQLite Query Console */}
            <div
              className={`p-4 rounded-2xl border shadow-inner ${
                isDark ? 'bg-black/60 border-slate-800' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Database className="w-3.5 h-3.5" />
                  <span>Career data notes</span>
                </div>
                <button
                  onClick={handleCopyQuery}
                  className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  {copiedQuery ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                <code>{currentGoat.dbmsComparisonQuery}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Horizontal Legend Navigation Strip */}
      <div
        className={`relative z-20 pt-4 border-t overflow-x-auto no-scrollbar flex items-center gap-2.5 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        {CRICKET_GOATS.map((goat, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={goat.id}
              onClick={() => {
                setCurrentIndex(idx);
                setCopiedQuery(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md scale-105'
                  : isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{goat.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({goat.countryCode})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
