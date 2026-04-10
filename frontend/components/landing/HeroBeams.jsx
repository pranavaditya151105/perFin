'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import { BeamsBackground } from './BeamsBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function HeroBeams() {
  return (
    <BeamsBackground intensity="strong" className="relative">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 w-full pt-24 pb-16">
        <motion.div
          className="max-w-3xl text-center z-20 flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A35E47]/20 border border-[#A35E47]/40 rounded-full text-sm font-semibold text-[#A35E47] mb-8 mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#A35E47] inline-block" />
            Built for Indian earners
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8 text-white">
            Your money{' '}
            <br className="hidden md:block" />
            <span style={{ color: '#A35E47' }}>finally has a brain.</span>
          </h1>

          <p className="text-lg md:text-2xl text-stone-300 mb-10 max-w-2xl leading-relaxed">
            PerFinAI reads your bank statement, tax filings, and payslips — then tells you
            exactly what to do next. No spreadsheets. No jargon.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-[#A35E47] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#A35E47]/90 transition-all shadow-lg hover:shadow-xl"
            >
              Get Your Health Score <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-sm text-stone-400 mt-8 flex items-center gap-2">
            <Shield className="w-4 h-4" /> No bank login. No credentials. Just documents you
            already own.
          </p>
        </motion.div>
      </div>
    </BeamsBackground>
  );
}
