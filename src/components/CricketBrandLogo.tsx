import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const CricketBrandLogo: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center gap-3.5 select-none">
      {/* Golden Trophy Crest Icon with Ambient Glow */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-amber-500/25 blur-md" />
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20 group-hover:rotate-6 transition-transform duration-300" />
          </div>
        </div>
      </div>

      {/* Brand Wordmark & Metadata Sub-Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`text-lg sm:text-xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: "'Cinzel', 'Plus Jakarta Sans', serif" }}
          >
            CRICKET
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-sm">
            DBMS
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span
            className={`text-[10px] font-mono font-medium tracking-wider uppercase ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Championship Score Engine
          </span>
        </div>
      </div>
    </div>
  );
};
