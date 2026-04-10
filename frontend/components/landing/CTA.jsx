'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function CTA() {
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden bg-stone-900">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #b45309 0%, transparent 70%)',
        }}
      />
      <motion.div
        className="max-w-3xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
          Find out your financial health <br className="hidden md:block" /> score in 2 minutes.
        </h2>
        <p className="text-xl text-stone-400 mb-10">
          No signup required. Upload a document and see your score instantly.
        </p>
        <Link
          href="/login"
          className="bg-amber-700 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-amber-600 transition-all inline-flex items-center gap-2 mx-auto shadow-xl shadow-amber-900/40"
        >
          Check My Financial Health <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="mt-6 text-sm text-stone-500 flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 shrink-0" /> Free. Private. No bank login needed.
        </p>
      </motion.div>
    </section>
  );
}
