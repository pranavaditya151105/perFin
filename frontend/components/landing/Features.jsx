'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const features = [
  {
    id: '1',
    title: 'Privacy-First Architecture',
    desc: 'Your financial data stays completely under your control. We never ask for bank credentials, OTPs, or sensitive information, ensuring a secure and trust-driven experience.',
  },
  {
    id: '2',
    title: 'AI Financial Chatbot',
    desc: 'Get instant, intelligent answers to your financial queries. Our AI assistant is focused strictly on finance, providing accurate guidance tailored to your profile.',
  },
  {
    id: '3',
    title: 'Smart Financial Health Score',
    desc: 'Understand your financial condition with a single score based on savings, debt, investments, and emergency readiness.',
  },
  {
    id: '5',
    title: 'Personalized AI Insights',
    desc: 'Receive customized recommendations based on your goals, spending patterns, and financial behavior to improve your financial decisions.',
  },
  {
    id: '6',
    title: 'Learning Modules',
    desc: 'Access curated financial learning content to improve your knowledge in areas like investing, taxation, and money management.',
  },
  {
    id: '7',
    title: 'CIBIL Score Estimation',
    desc: 'Track and understand your credit health with a simplified CIBIL score model along with actionable suggestions to improve it.',
  },
  {
    id: '8',
    title: 'Smart Tax Assistant (ITR Filing)',
    desc: 'Get tax regime recommendations, calculate your tax, and follow step-by-step guidance to file your income tax return accurately.',
  },
];

export default function Features() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false); // starts false until in view
  const sectionRef = useRef(null);

  // Only run autoplay when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsAutoPlay(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, currentIndex]);

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex < 0) newIndex = features.length - 1;
      if (newIndex >= features.length) newIndex = 0;
      return newIndex;
    });
  };

  const handleDragEnd = (_event, info) => {
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 5000);
    const swipeThreshold = 50;
    const swipe = info.offset.x;
    const velocity = info.velocity.x;
    if (swipe > swipeThreshold || velocity > 500) {
      paginate(-1);
    } else if (swipe < -swipeThreshold || velocity < -500) {
      paginate(1);
    }
  };

  const handleTouchStart = (e) => {
    setIsAutoPlay(false);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTimeout(() => setIsAutoPlay(true), 5000);
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) paginate(1);
      else paginate(-1);
    }
  };

  const currentFeature = features[currentIndex];

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-black" id="features">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-3xl md:text-5xl font-bold mb-16 text-white text-center"
        >
          Everything you need.{' '}
          <span style={{ color: '#A35E47' }}>Nothing you don&apos;t.</span>
        </motion.h2>

        <div className="flex flex-col items-center justify-center gap-8 mt-8">
          {/* Card Stack */}
          <div className="relative w-full max-w-2xl">
            {/* Background stack effect */}
            {[2, 1].map((offset) => (
              <motion.div
                key={offset}
                className="absolute inset-0 bg-[#A35E47]/15 border border-[#A35E47]/40 rounded-3xl pointer-events-none"
                style={{ zIndex: -offset }}
                initial={{ y: offset * 8, opacity: 0.6 }}
                animate={{ y: offset * 8, opacity: 0.6 }}
              />
            ))}

            {/* Main Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                }}
                drag="x"
                dragElastic={0.3}
                dragMomentum={true}
                onDragEnd={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                whileDrag={{ scale: 0.98 }}
                className="w-full bg-gradient-to-br from-[#A35E47]/20 to-[#A35E47]/10 border-2 border-[#A35E47]/40 rounded-3xl p-8 md:p-12 flex flex-col justify-between hover:border-[#A35E47]/60 transition-colors cursor-grab active:cursor-grabbing"
                style={{ zIndex: 10, touchAction: 'none' }}
              >
                {/* Card Number */}
                <div className="flex items-start justify-between mb-6">
                  <span className="text-[#A35E47] font-bold text-sm">
                    {currentIndex + 1} / {features.length}
                  </span>
                  <div className="w-12 h-12 rounded-full border-2 border-[#A35E47]/40 flex items-center justify-center">
                    <span className="text-[#A35E47] font-semibold text-lg">
                      {currentIndex + 1}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {currentFeature.title}
                  </h3>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 flex items-center"
                >
                  <p className="text-lg text-stone-200 leading-relaxed">{currentFeature.desc}</p>
                </motion.div>

                {/* Drag Indicator */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center text-sm text-[#A35E47]/60 mt-6"
                >
                  ← Drag to explore →
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(-1)}
              className="w-12 h-12 rounded-full border-2 border-[#A35E47]/40 flex items-center justify-center text-[#A35E47] hover:border-[#A35E47]/60 hover:bg-[#A35E47]/10 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <div className="flex items-center gap-2">
              {features.map((_, index) => (
                <motion.div
                  key={index}
                  className="h-2 rounded-full bg-[#A35E47]"
                  animate={{
                    width: index === currentIndex ? 24 : 8,
                    opacity: index === currentIndex ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(1)}
              className="w-12 h-12 rounded-full border-2 border-[#A35E47]/40 flex items-center justify-center text-[#A35E47] hover:border-[#A35E47]/60 hover:bg-[#A35E47]/10 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
