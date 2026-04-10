'use client';

import { motion } from 'framer-motion';
import { FileText, Cpu, LineChart } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const steps = [
  {
    icon: FileText,
    title: '1. Upload your documents',
    sub: 'Payslip PDF, bank statement, Form 26AS. No bank login required.',
    tags: ['PDF', 'XLSX', 'JSON'],
  },
  {
    icon: Cpu,
    title: '2. AI reads & understands',
    sub: 'Parses income, expenses, and tax position. PII scrubbed instantly.',
    tags: ['Extraction', 'Analysis'],
  },
  {
    icon: LineChart,
    title: '3. Get your roadmap',
    sub: 'Actionable tips, what-if simulations, and clear goal tracking.',
    tags: ['Score', 'Chat'],
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-stone-50" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-stone-900"
        >
          Three steps to financial clarity.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-stone-200" />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow relative z-10 flex flex-col"
            >
              <div className="w-14 h-14 bg-amber-800 text-white rounded-2xl flex items-center justify-center mb-7 shadow-lg shadow-amber-900/20 shrink-0">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-900">{step.title}</h3>
              <p className="text-stone-500 mb-7 flex-grow leading-relaxed">{step.sub}</p>
              <div className="flex gap-2 flex-wrap">
                {step.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-stone-100 text-stone-500 rounded-lg border border-stone-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
