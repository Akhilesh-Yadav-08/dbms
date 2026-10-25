import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';
import { Trophy, Sparkles, ShieldCheck, Flame, ChevronRight } from 'lucide-react';

interface ChampionshipTrophy3DProps {
  className?: string;
  onExplore?: () => void;
}

export const ChampionshipTrophy3D: React.FC<ChampionshipTrophy3DProps> = ({
  className = '',
  onExplore,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coordinate offsets normalized from -0.5 (left/top) to +0.5 (right/bottom)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for liquid perspective tilting without jitter
  const springConfig = { damping: 22, stiffness: 220, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Perspective Rotation Angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [16, -16]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);

  // Dynamic light reflection coordinates (percentage across surface)
  const sheenX = useTransform(smoothX, [-0.5, 0.5], ['15%', '85%']);
  const sheenY = useTransform(smoothY, [-0.5, 0.5], ['15%', '85%']);
  const sheenGradient = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.4) 0%, rgba(245,158,11,0.18) 35%, transparent 70%)`;

  // Dynamic ground shadow displacement reflecting light source direction
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [-24, 24]);
  const shadowY = useTransform(smoothY, [-0.5, 0.5], [-18, 30]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onExplore}
      style={{ perspective: 1200 }}
      className={`relative select-none cursor-pointer group py-4 ${className}`}
    >
      {/* 3D Depth Card Chassis */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={
          !isHovered
            ? {
                rotateY: [-5, 5, -5],
                rotateX: [3, -3, 3],
              }
            : undefined
        }
        transition={
          !isHovered
            ? {
                repeat: Infinity,
                duration: 6,
                ease: 'easeInOut',
              }
            : undefined
        }
        className="relative w-72 h-84 sm:w-80 sm:h-96 rounded-3xl p-3 bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-900/95 border border-amber-500/40 shadow-2xl transition-all duration-300 group-hover:border-amber-400 group-hover:shadow-[0_30px_70px_-15px_rgba(245,158,11,0.3)]"
      >
        {/* Layer 0: Ground Pedestal & Ambient Stadium Flare (Deep background translateZ -45px) */}
        <div
          style={{ transform: 'translateZ(-45px)' }}
          className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
        >
          {/* Radial gold halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-amber-500/25 via-yellow-400/15 to-emerald-500/10 rounded-full filter blur-3xl" />

          {/* Rotating Orbital Gyro Rings */}
          <div className="absolute inset-2 rounded-2xl border border-amber-500/20 border-dashed animate-[spin_50s_linear_infinite]" />
          <div className="absolute inset-6 rounded-2xl border border-emerald-500/15 border-dotted animate-[spin_35s_linear_infinite_reverse]" />
        </div>

        {/* Layer 1: Metallic Bevel Border & Inset Frame (translateZ 0px) */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 flex flex-col justify-between p-3.5">
          {/* Top Floating Micro-Status (translateZ +35px) */}
          <div
            style={{ transform: 'translateZ(35px)' }}
            className="flex items-center justify-between z-20"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/40 shadow-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300">
                Official Trophy
              </span>
            </div>

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>DBMS Tier 1</span>
            </div>
          </div>

          {/* Layer 2: Main 3D Trophy Showcase (translateZ +55px with specular gloss) */}
          <div
            style={{ transform: 'translateZ(55px)' }}
            className="relative flex-1 flex items-center justify-center my-2"
          >
            {/* The 3D Rendered Trophy Asset Container */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-amber-500/30 bg-slate-950">
              <img
                src="/src/assets/images/championship_trophy_3d_1792912244747.jpg"
                alt="3D Gold Championship Cricket Trophy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dynamic Interactive Specular Light Sheen Overlay (GPU-accelerated template) */}
              <motion.div
                style={{ background: sheenGradient }}
                className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
              />

              {/* Glass sheen diagonal sweep */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Floating Sparkle Particle Indicator */}
            <motion.div
              animate={{ y: [-3, 3, -3], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ transform: 'translateZ(75px)' }}
              className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg pointer-events-none"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Layer 3: Foreground Engraved Plinth Badge (translateZ +75px) */}
          <div
            style={{ transform: 'translateZ(75px)' }}
            className="z-20 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-500/40 shadow-xl flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase">
                  Championship Plinth
                </span>
              </div>
              <h3 className="text-xs font-black text-white tracking-tight mt-0.5">
                Global Oval Trophy · 2026
              </h3>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform">
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Layer 4: Cast Dynamic Perspective Ground Shadow */}
        <motion.div
          style={{
            x: shadowX,
            y: shadowY,
            transform: 'translateZ(-60px)',
          }}
          className="absolute -bottom-8 left-6 right-6 h-10 bg-amber-500/20 rounded-full filter blur-xl pointer-events-none"
        />
      </motion.div>
    </div>
  );
};
