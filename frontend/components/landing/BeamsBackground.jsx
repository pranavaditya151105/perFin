'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function createBeam(width, height) {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 12 + Math.random() * 15,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({ className, intensity = 'strong', children }) {
  const canvasRef = useRef(null);
  const beamsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const MINIMUM_BEAMS = 20;

  const opacityMap = { subtle: 0.7, medium: 0.85, strong: 1 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let started = false;

    const updateCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      const totalBeams = MINIMUM_BEAMS * 1.5;
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(window.innerWidth, window.innerHeight)
      );
    };

    const resetBeam = (beam, index, totalBeams) => {
      const column = index % 3;
      const spacing = window.innerWidth / 3;
      beam.y = window.innerHeight + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 12 + (index * 15) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    };

    const drawBeam = (ctx, beam) => {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);

      const pulsingOpacity =
        beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];

      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'blur(35px)';

      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams);
        }
        drawBeam(ctx, beam);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Defer canvas setup until browser is idle so it doesn't block FCP
    const startAnimation = () => {
      if (started) return;
      started = true;
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      animate();
    };

    // Use requestIdleCallback if available, otherwise short rAF delay
    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(startAnimation, { timeout: 400 });
      return () => {
        window.cancelIdleCallback(idleId);
        window.removeEventListener('resize', updateCanvasSize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    } else {
      // Fallback: defer by 100ms so React can paint children first
      const timer = setTimeout(startAnimation, 100);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateCanvasSize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [intensity]);

  return (
    <div className={cn('relative min-h-screen w-full overflow-hidden bg-black', className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(15px)' }}
      />
      <motion.div
        className="absolute inset-0 bg-black/40 pointer-events-none"
        animate={{ opacity: [0.4, 0.5, 0.4] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
        style={{ backdropFilter: 'blur(50px)' }}
      />
      <div className="relative z-20 w-full">{children}</div>
    </div>
  );
}
