'use client';

import { useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '../lib/auth-store';

// Critical above-the-fold — loaded eagerly
import LandingNav from '../components/landing/LandingNav';
import HeroBeams from '../components/landing/HeroBeams';

// Below-the-fold — lazy loaded so they don't block FCP
const Problem = dynamic(() => import('../components/landing/Problem'), { ssr: false });
const HowItWorks = dynamic(() => import('../components/landing/HowItWorks'), { ssr: false });
const Features = dynamic(() => import('../components/landing/Features'), { ssr: false });
const Privacy = dynamic(() => import('../components/landing/Privacy'), { ssr: false });
const WhoIsItFor = dynamic(() => import('../components/landing/WhoIsItFor'), { ssr: false });
const CTA = dynamic(() => import('../components/landing/CTA'), { ssr: false });
const LandingFooter = dynamic(() => import('../components/landing/LandingFooter'), { ssr: false });

// Lightweight loading placeholder
function SectionFallback() {
  return <div className="min-h-[200px] bg-inherit" />;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div
      style={{
        fontFamily: 'var(--font-inter, Inter, ui-sans-serif, system-ui, sans-serif)',
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Critical path — no suspense wrapper, renders immediately */}
      <LandingNav />
      <HeroBeams />

      {/* Below-the-fold — loaded lazily after hero paints */}
      <Suspense fallback={<SectionFallback />}>
        <Problem />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Features />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Privacy />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <WhoIsItFor />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CTA />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}
