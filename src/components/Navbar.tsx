import React from 'react';
import { RotateCcw, Database, Shield, Zap, Sparkles, Sun, Moon, Flame, Users, Calendar, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { CricketBrandLogo } from './CricketBrandLogo';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onResetDb: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onResetDb }) => {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'goats', label: 'Legends & GOATs', icon: Flame },
    { id: 'teams', label: 'Teams' },
    { id: 'players', label: 'Players' },
    { id: 'matches', label: 'Matches' },
    { id: 'scores', label: 'Live Scoring', isLive: true },
    { id: 'performances', label: 'Performances' },
    { id: 'viva', label: 'Data Studio', icon: Database },
  ];

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-2xl border-b transition-colors duration-500 ${
        isDark
          ? 'bg-[#05080d]/68 border-white/10 shadow-none'
          : 'bg-white/85 border-slate-200 shadow-md shadow-slate-200/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: CricketDBMS Brand Identity */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="group text-left cursor-pointer shrink-0"
        >
          <CricketBrandLogo />
        </button>

        {/* Zone 2: Navigation Links with Animated Active Indicator */}
        <nav
          className={`hidden xl:flex items-center gap-1 p-1.5 rounded-2xl border transition-colors ${
            isDark
            ? 'bg-transparent border-white/10'
              : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-slate-950 font-black'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbarActiveTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-xl shadow-[0_8px_25px_-16px_rgba(251,191,36,.9)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.isLive && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {Icon && !item.isLive && <Icon className="w-3.5 h-3.5 text-amber-500" />}
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* THEME TOGGLE (Accessible Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode (Refined Alabaster)' : 'Switch to Dark Mode (Cosmic Charcoal Stadium)'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm flex items-center justify-center ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 border-amber-500/30 text-amber-300 hover:border-amber-400 shadow-amber-500/10'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-amber-600 shadow-slate-200/50'
            }`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-[spin_20s_linear_infinite]" />
            ) : (
              <Moon className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Reset Database Button */}
          <button
            onClick={onResetDb}
            title="Restore match data"
            className={`group inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm border ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-amber-500/40'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-amber-500 shadow-slate-200/40'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Reset DB</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Scrollable Strip */}
      <div
        className={`xl:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 border-t no-scrollbar ${
          isDark
            ? 'bg-slate-950/95 border-slate-800'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 ${
              currentTab === item.id
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950'
                : isDark
                ? 'text-slate-300 hover:bg-white/10'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
