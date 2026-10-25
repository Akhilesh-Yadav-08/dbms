import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

type Star = { x: number; y: number; radius: number; opacity: number; phase: number; speed: number };

/**
 * A background-only star field. It deliberately lives outside the Three.js scene,
 * so its pixels never contribute to the trophy's lighting, reflections, or effects.
 */
export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame = 0;
    let stars: Star[] = [];
    let width = 0;
    let height = 0;

    const random = (() => {
      let seed = 9137;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
    })();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);

      const count = Math.min(155, Math.max(70, Math.round((width * height) / 16000)));
      stars = Array.from({ length: count }, () => ({
        x: random() * width,
        y: random() * height,
        radius: random() > 0.87 ? random() * 1.2 + 1.05 : random() * 0.62 + 0.22,
        opacity: random() * 0.46 + 0.34,
        phase: random() * Math.PI * 2,
        speed: random() * 0.7 + 0.25,
      }));
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      if (!isDark) return;

      // Sparse amber particles and a warm pool mirror the provided trophy scene.
      const drift = reducedMotion ? 0.5 : (Math.sin(time * 0.00013) + 1) / 2;
      const pool = context.createRadialGradient(
        width * (0.32 + drift * 0.36), height * 0.26, 0,
        width * (0.32 + drift * 0.36), height * 0.26, Math.max(width, height) * 0.42
      );
      pool.addColorStop(0, 'rgba(255, 184, 42, 0.075)');
      pool.addColorStop(0.42, 'rgba(210, 129, 12, 0.025)');
      pool.addColorStop(1, 'rgba(210, 129, 12, 0)');
      context.fillStyle = pool;
      context.fillRect(0, 0, width, height);

      for (const star of stars) {
        const shimmer = reducedMotion ? 1 : 0.72 + Math.sin(time * 0.0012 * star.speed + star.phase) * 0.28;
        const alpha = star.opacity * shimmer;
        if (star.radius > 1) {
          const glow = context.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 5);
          glow.addColorStop(0, `rgba(255, 232, 128, ${alpha})`);
          glow.addColorStop(0.18, `rgba(255, 190, 42, ${alpha * 0.65})`);
          glow.addColorStop(1, 'rgba(255, 170, 20, 0)');
          context.fillStyle = glow;
          context.fillRect(star.x - star.radius * 5, star.y - star.radius * 5, star.radius * 10, star.radius * 10);
        }
        context.beginPath();
        context.fillStyle = `rgba(255, 222, 102, ${alpha})`;
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (!reducedMotion) animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-[1] pointer-events-none" />;
};
