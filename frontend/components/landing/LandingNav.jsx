'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '/chat', label: 'AI Advisor' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#who', label: 'For Who' },
];

export default function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
      <nav className="w-full max-w-5xl">
        <div className="bg-stone-900/50 backdrop-blur-xl border border-stone-700/40 rounded-full px-8 h-16 flex items-center shadow-lg relative">
          {/* Logo - Fixed width for symmetry if needed, or flex-1 */}
          <div className="flex-1 flex items-center gap-1.5 font-bold text-lg tracking-tight text-white">
            PerFin
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: '#A35E47' }}
            />
          </div>

          {/* Links - Absolute Centering for perfect alignment */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center text-sm font-medium text-stone-300">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTA - flex-1 and justify-end to balance the logo */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <a
              href="https://stocks1-n891.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block text-stone-400 hover:text-white text-sm font-medium transition-colors"
            >
              Stock Analyzer
            </a>
            <Link
              href="/login"
              className="hidden md:block bg-[#A35E47] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#A35E47]/90 transition-colors shadow-lg"
            >
              Get Started
            </Link>

            <button
              className="md:hidden p-2 text-white rounded-lg hover:bg-white/20 transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-stone-900/50 backdrop-blur-xl border border-stone-700/40 rounded-3xl mt-3 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-stone-300 overflow-hidden"
            >
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
              <a
                href="https://stocks1-n891.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-[#A35E47]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Stock Analyzer
              </a>
              <Link
                href="/login"
                className="bg-[#A35E47] text-white px-5 py-2.5 rounded-full text-sm font-medium w-full mt-1 hover:bg-[#A35E47]/90 transition-colors text-center block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
