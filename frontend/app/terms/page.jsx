'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 w-full z-50 bg-white/5 backdrop-blur-md border-b border-stone-700 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-amber-700 hover:text-amber-600 transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              Terms of <span style={{ color: '#A35E47' }}>Service</span>
            </h1>
            <div className="text-stone-300 space-y-6 leading-relaxed">
              <p>Last updated: April 10, 2026</p>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using PerFinAI, you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to abide by the above,
                  please do not use this service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the materials on
                  PerFinAI for personal, non-commercial transitory viewing only. Under this
                  license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>
                    Use the materials for any commercial purpose or for any public display
                  </li>
                  <li>
                    Attempt to decompile or reverse engineer any software contained on PerFinAI
                  </li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>
                    Transfer the materials to another person or &quot;mirror&quot; the materials
                    on any other server
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
                <p>
                  The materials on PerFinAI are provided on an &apos;as is&apos; basis. PerFinAI
                  makes no warranties, expressed or implied, and hereby disclaims and negates all
                  other warranties.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
                <p>
                  In no event shall PerFinAI or its suppliers be liable for any damages arising
                  out of the use or inability to use the materials on PerFinAI.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Materials</h2>
                <p>
                  The materials appearing on PerFinAI could include technical, typographical, or
                  photographic errors. PerFinAI does not warrant that any materials are accurate,
                  complete, or current.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Modifications</h2>
                <p>
                  PerFinAI may revise these terms of service at any time without notice. By using
                  this website, you are agreeing to be bound by the current version.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in accordance with the
                  laws of India.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">8. Contact</h2>
                <p>
                  If you have any questions, please contact us at{' '}
                  <a
                    href="mailto:legal@perfin.me"
                    className="text-amber-500 hover:text-amber-400"
                  >
                    legal@perfin.me
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
