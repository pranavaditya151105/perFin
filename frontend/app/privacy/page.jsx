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

export default function PrivacyPolicyPage() {
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
              Privacy <span style={{ color: '#A35E47' }}>Policy</span>
            </h1>
            <div className="text-stone-300 space-y-6 leading-relaxed">
              <p>Last updated: April 10, 2026</p>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                <p>
                  PerFinAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
                  protecting your privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                <p>We collect information you voluntarily provide to us, such as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Financial documents (bank statements, tax returns, payslips)</li>
                  <li>Basic profile information (email, name, contact details)</li>
                  <li>Usage data and interactions with our platform</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  3. How We Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and improve our financial analysis services</li>
                  <li>To generate personalized financial insights and recommendations</li>
                  <li>To communicate with you about your account</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                <p>
                  We implement advanced security measures to protect your sensitive financial
                  information. Your data is encrypted and stored securely. We never store your
                  bank credentials or OTPs.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Sharing</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We
                  only share information when required by law or with your explicit consent.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                <p>
                  You have the right to access, modify, or delete your personal information.
                  Contact us at privacy@perfin.me for any requests.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a
                    href="mailto:privacy@perfin.me"
                    className="text-amber-500 hover:text-amber-400"
                  >
                    privacy@perfin.me
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
