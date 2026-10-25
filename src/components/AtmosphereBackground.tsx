import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const AtmosphereBackground: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700 select-none">
      {isDark ? (
        // DARK THEME: Deep Obsidian / Charcoal Foundation with Stadium Floodlights & Cinematic Mist
        <div className="absolute inset-0 bg-[#020202]">
          {/* Subtle dusk stadium silhouette overlay */}
          <div
            className="hidden absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-[0.12] mix-blend-screen transition-opacity duration-700"
            style={{
              backgroundImage: 'url(/src/assets/images/stadium_championship_night_1792915349132.jpg)',
            }}
          />

          {/* Deep charcoal radial gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_48%_35%_at_50%_38%,rgba(134,77,8,.20),transparent_70%),radial-gradient(ellipse_28%_18%_at_50%_78%,rgba(244,171,29,.14),transparent_76%),linear-gradient(180deg,#020202_0%,#060300_48%,#000000_100%)]" />

          {/* Subtle gold spotlight in upper center for trophy rim illumination */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-radial from-amber-400/[0.13] via-amber-600/[0.045] to-transparent rounded-full filter blur-[110px] animate-[pulse_9s_ease-in-out_infinite]" />

          {/* Dual Stadium Floodlight Beams (Left & Right) */}
          <div className="absolute top-0 left-1/6 w-96 h-96 bg-amber-300/[0.025] rounded-full filter blur-[100px] animate-[pulse_11s_ease-in-out_infinite]" />
          <div className="absolute top-0 right-1/6 w-96 h-96 bg-amber-500/[0.03] rounded-full filter blur-[100px] animate-[pulse_13s_ease-in-out_infinite]" />

          {/* Stars are rendered by the standalone StarfieldCanvas above this layer.
              It is intentionally not part of the trophy's WebGL renderer. */}
        </div>
      ) : (
        // LIGHT THEME: Refined Pale Neutral Foundation (Alabaster / Slate Slate) with Soft Warm Stadium Light
        <div className="absolute inset-0 bg-[#f8fafc]">
          {/* Subtle daytime architectural lighting overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-50 to-slate-100" />

          {/* Soft daylight stadium backdrop with very subtle transparency */}
          <div
            className="absolute inset-0 bg-cover bg-bottom bg-no-repeat opacity-[0.06] grayscale contrast-125 transition-opacity duration-700"
            style={{
              backgroundImage: 'url(/src/assets/images/stadium_championship_night_1792915349132.jpg)',
            }}
          />

          {/* Warm sunlight halo behind the trophy centerpiece */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-radial from-amber-400/15 via-amber-200/5 to-transparent rounded-full filter blur-[110px]" />

          {/* Refined cool ambient corner fills */}
          <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-slate-200/40 rounded-full filter blur-[120px]" />
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-amber-100/30 rounded-full filter blur-[120px]" />
        </div>
      )}
    </div>
  );
};
