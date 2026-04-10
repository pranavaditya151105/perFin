'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, EyeOff, UserCheck, ServerOff, ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const privacyFeatures = [
  {
    icon: Shield,
    title: 'Zero credential access',
    desc: 'We never ask for your bank login, UPI PIN, or Aadhaar. You upload documents you already have.',
  },
  {
    icon: EyeOff,
    title: 'PII stripped at parse',
    desc: 'Account numbers and VPAs are replaced with [ID] tokens instantly. We never store raw data.',
  },
  {
    icon: UserCheck,
    title: 'You own your data',
    desc: "Delete your data anytime. We don't sell, share, or train on your personal financial info.",
  },
  {
    icon: ServerOff,
    title: 'Session-only processing',
    desc: 'Documents are parsed in your session only. Nothing stored server-side after analysis.',
  },
];

const dataFlow = [
  { label: 'Document Upload', sub: 'Payslip / Bank PDF / 26AS', highlight: false, final: false },
  { label: 'PII Scrubber', sub: 'IDs → [tokens]', highlight: true, final: false },
  { label: 'AI Engine', sub: 'LLM analysis', highlight: false, final: false },
  { label: 'Insights', sub: 'Score + recommendations', highlight: false, final: true },
];

function ScrollStrikethrough() {
  const ref = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const element = ref.current.parentElement;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      let progress = 0;
      if (rect.top < windowHeight && rect.bottom > 0) {
        progress = (1 - rect.top / windowHeight) * 2;
        progress = Math.max(0, Math.min(1, progress));
      }
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      className="mt-12 flex items-center justify-center gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
    >
      {/* Original Text Container */}
      <div className="relative inline-block group">
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, rgba(239,68,68,0) 0%, rgba(239,68,68,${
              scrollProgress * 0.3
            }) 50%, rgba(239,68,68,0) 100%)`,
          }}
        />
        <motion.span
          className="relative text-2xl md:text-3xl font-bold text-stone-200 transition-all duration-300"
          animate={{
            opacity: Math.max(0.75 - scrollProgress * 0.25, 0.75),
            scale: 1 - scrollProgress * 0.05,
          }}
          transition={{ duration: 0.1 }}
        >
          Bank login / Credentials
        </motion.span>

        {/* Animated Strikethrough Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 transform -translate-y-1/2">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-transparent opacity-0" />
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-red-400 to-red-500"
            style={{
              width: `${scrollProgress * 100}%`,
              boxShadow: `0 0 ${20 * scrollProgress}px rgba(239,68,68,${scrollProgress}), 0 0 ${
                10 * scrollProgress
              }px rgba(239,68,68,${scrollProgress * 0.5})`,
              transition:
                scrollProgress === 0
                  ? 'none'
                  : 'width 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease-out',
            }}
          />
          {scrollProgress > 0 && (
            <motion.div
              className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-300 rounded-full"
              style={{
                left: `${scrollProgress * 100}%`,
                opacity: scrollProgress < 1 ? 1 : 0,
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Arrow Divider */}
      <motion.div
        animate={{
          opacity: scrollProgress > 0.2 ? 1 : 0,
          scale: scrollProgress > 0.2 ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-px bg-gradient-to-r from-red-500 to-transparent" />
      </motion.div>

      {/* Replacement Text */}
      <motion.div
        className="relative"
        animate={{
          opacity: scrollProgress > 0.3 ? 1 : 0,
          x: scrollProgress > 0.3 ? 0 : 20,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute inset-0 rounded-lg blur-xl opacity-0"
          style={{
            background: `rgba(239,68,68,${Math.max(0, scrollProgress - 0.3) * 0.4})`,
          }}
        />
        <motion.span
          className="relative text-2xl md:text-3xl font-black text-red-400 block"
          animate={{
            opacity: scrollProgress > 0.3 ? 1 : 0,
            scale: scrollProgress > 0.3 ? 1 : 0.9,
          }}
          transition={{ duration: 0.4 }}
        >
          never required
        </motion.span>
        <motion.span
          className="relative text-lg md:text-xl text-red-500/70 block font-medium"
          animate={{ opacity: scrollProgress > 0.5 ? 1 : 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          — privacy always
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export default function Privacy() {
  return (
    <section className="py-24 px-6 bg-stone-900 text-stone-50" id="privacy">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white">
            We see your numbers.
            <br />
            Never your identity.
          </h2>
          <p className="text-stone-400 text-lg leading-relaxed">
            Your financial data is yours. We built this so you never have to hand over
            credentials to get clarity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {privacyFeatures.map((trust, i) => (
            <motion.div
              key={i}
              className="bg-stone-800/50 border border-stone-700 p-6 rounded-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <trust.icon className="w-8 h-8 text-amber-500 mb-4" />
              <h4 className="font-bold text-lg mb-2 text-white">{trust.title}</h4>
              <p className="text-sm text-stone-400 leading-relaxed">{trust.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="bg-stone-800 border border-stone-700 rounded-3xl p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-6 text-center">
            How your data flows
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {dataFlow.map((node, i) => (
              <div key={i} className="contents">
                <div
                  className={`flex-1 text-center p-4 rounded-xl border font-mono text-sm ${
                    node.final
                      ? 'bg-white text-stone-900 border-white font-bold'
                      : node.highlight
                      ? 'bg-stone-900 border-amber-700/60 text-amber-400'
                      : 'bg-stone-900 text-stone-300 border-stone-700'
                  }`}
                >
                  <div className="font-semibold">{node.label}</div>
                  <div className="text-xs mt-1 opacity-60">{node.sub}</div>
                </div>
                {i < dataFlow.length - 1 && (
                  <ArrowRight className="text-stone-600 hidden md:block shrink-0 w-4 h-4" />
                )}
              </div>
            ))}
          </div>
          <ScrollStrikethrough />
        </motion.div>
      </div>
    </section>
  );
}
