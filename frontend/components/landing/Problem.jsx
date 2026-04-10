'use client';

import { motion } from 'framer-motion';
import { IndianRupee, TrendingDown, Calendar } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const problems = [
  {
    icon: IndianRupee,
    title: 'You earn well. But where does it go?',
    desc: "Lifestyle creep is real. You're saving less than you should, but you can't pinpoint exactly where the leak is.",
  },
  {
    icon: TrendingDown,
    title: 'Your CIBIL dropped. You found out too late.',
    desc: 'A forgotten \u20b9500 subscription or high credit utilization quietly tanked your score without warning.',
  },
  {
    icon: Calendar,
    title: 'Tax season hits. You\u2019re scrambling.',
    desc: "You're missing out on 80C, 80D, and HRA optimizations because nobody told you to structure it in advance.",
  },
];

export default function Problem() {
  return (
    <section className="py-24 bg-white px-6 border-y border-stone-200" id="problem">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold text-center mb-16 text-stone-900 leading-tight"
        >
          Most Indians have no idea what their{' '}
          <br className="hidden md:block" />
          financial health actually looks like.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-stone-50 p-8 rounded-3xl border border-stone-200 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-12 h-12 bg-white rounded-2xl border border-stone-200 flex items-center justify-center mb-6 text-amber-800 shadow-sm">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-900 leading-snug">{item.title}</h3>
              <p className="text-stone-500 leading-relaxed text-sm md:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
