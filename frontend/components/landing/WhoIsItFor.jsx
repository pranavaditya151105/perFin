'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const personas = [
  {
    init: 'P',
    name: 'Priya',
    role: 'Salaried Professional (25–35)',
    quote:
      'Priya earns ₹80K/month but saves less than ₹8K. PerFinAI showed her exactly where ₹22K was silently leaking.',
    metric: 'Found ₹22k/mo in leaks',
  },
  {
    init: 'A',
    name: 'Arjun',
    role: 'Freelancer / Consultant',
    quote:
      "Arjun's income swings between ₹20K and ₹2L. PerFinAI smooths the picture and tells him when he can afford to invest.",
    metric: 'Smoothed 3-mo cashflow',
  },
  {
    init: 'R',
    name: 'Ravi',
    role: 'Small Business Owner',
    quote:
      'Ravi uploads his GST returns. PerFinAI separates business cash flow from personal expenses and flags advance tax exposure.',
    metric: 'Flagged advance tax risk',
  },
];

export default function WhoIsItFor() {
  return (
    <section className="py-24 px-6 bg-stone-50" id="who">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-stone-900"
        >
          Built for how Indians actually work and earn.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {personas.map((persona, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                  {persona.init}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">{persona.name}</h4>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    {persona.role}
                  </p>
                </div>
              </div>
              <p className="text-stone-600 italic mb-6 leading-relaxed text-sm">
                &quot;{persona.quote}&quot;
              </p>
              <div className="inline-block bg-stone-50 border border-stone-200 text-stone-700 text-sm font-medium px-3 py-1.5 rounded-lg">
                Outcome:{' '}
                <span className="text-amber-800 font-semibold">{persona.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
