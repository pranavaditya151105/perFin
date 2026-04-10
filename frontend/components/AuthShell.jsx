'use client';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

/**
 * Shared auth page shell — beams background + centered pill card.
 * All auth logic lives in the children (Login / Signup forms).
 */
export default function AuthShell({ children, title, subtitle, step, totalSteps }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#090909' }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(163,94,71,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Animated ambient blobs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(163,94,71,0.12) 0%, transparent 70%)',
          top: '-10%',
          left: '20%',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(163,94,71,0.08) 0%, transparent 70%)',
          bottom: '5%',
          right: '15%',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors text-sm font-medium z-20"
      >
        <span>←</span> Home
      </Link>

      {/* Logo top center */}
      <Link
        href="/"
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20"
      >
        <div
          className="flex items-center gap-1.5 text-white font-bold text-lg tracking-tight"
        >
          <TrendingUp className="w-5 h-5" style={{ color: '#A35E47' }} />
          PerFinAI
        </div>
      </Link>

      {/* Main pill card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="rounded-3xl border p-8 md:p-10"
          style={{
            background: 'rgba(28, 25, 23, 0.85)',
            borderColor: 'rgba(163,94,71,0.25)',
            backdropFilter: 'blur(20px)',
            boxShadow:
              '0 0 0 1px rgba(163,94,71,0.1), 0 32px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Step indicator */}
          {totalSteps > 1 && (
            <div className="flex gap-1.5 mb-8">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full flex-1"
                  animate={{
                    backgroundColor:
                      i < step
                        ? '#A35E47'
                        : i === step - 1
                        ? '#A35E47'
                        : 'rgba(163,94,71,0.2)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Title block */}
          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-white mb-1.5"
            >
              {title}
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed">{subtitle}</p>
          </div>

          {/* Form slot */}
          {children}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-stone-600 mt-6 px-4">
          PerFinAI provides financial insights for informational purposes only.{' '}
          <span className="text-stone-500">Not SEBI-registered investment advice.</span>
        </p>
      </motion.div>
    </div>
  );
}
