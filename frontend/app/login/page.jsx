'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import api, { getProfile } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import { usePerFinStore } from '../../lib/store';
import AuthShell from '../../components/AuthShell';

/* ─── Shared input component ─────────────────────────────────────── */
function AuthInput({ icon: Icon, type, placeholder, value, onChange, autoFocus, rightSlot }) {
  return (
    <div
      className="relative flex items-center rounded-xl border transition-colors focus-within:border-[#A35E47]/80"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {Icon && (
        <Icon className="absolute left-4 w-4 h-4 text-stone-500 pointer-events-none" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        required
        className="w-full bg-transparent text-white text-sm placeholder-stone-500 outline-none py-3.5 pl-11 pr-11"
      />
      {rightSlot && (
        <div className="absolute right-3">{rightSlot}</div>
      )}
    </div>
  );
}

/* ─── Error message ───────────────────────────────────────────────── */
function AuthError({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
    >
      {message}
    </motion.div>
  );
}

/* ─── Primary button ─────────────────────────────────────────────── */
function AuthButton({ children, loading, disabled, type = 'submit' }) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: loading || disabled ? '#7a463a' : '#A35E47' }}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {children} <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

/* ─── Login form content ─────────────────────────────────────────── */
function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAnalysis = usePerFinStore((s) => s.setAnalysis);

  const titleMap = {
    1: 'Welcome back',
    2: 'Enter your password',
  };
  const subtitleMap = {
    1: 'Sign in to your PerFinAI account',
    2: email,
  };

  const handleEmailNext = (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setError(null);
    setStep(2);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { data } = await api.post('auth/login', { email, password });
      
      // Clear store before setting new auth
      usePerFinStore.getState().reset();
      
      // Use actual user data from the login response
      setAuth(data.user, data.access_token);

      try {
        const profile = await getProfile();
        setAnalysis(profile);
        router.push('/dashboard');
      } catch (pErr) {
        router.push('/input');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Incorrect email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={titleMap[step]}
      subtitle={subtitleMap[step]}
      step={step}
      totalSteps={2}
    >
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="email-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleEmailNext}
            className="flex flex-col gap-4"
          >
            <AuthInput
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <AuthError message={error} />
            <AuthButton>Continue</AuthButton>
            <div className="text-center text-sm text-stone-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#A35E47] hover:text-[#c07060] font-medium transition-colors">
                Sign up
              </Link>
            </div>
            <div className="text-center">
              <Link href="/forgot-password" size="sm" className="text-xs text-stone-400 hover:text-[#A35E47] transition-colors">
                Forgot your password?
              </Link>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="password-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >
            <AuthInput
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-stone-500 hover:text-stone-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" size="sm" className="text-xs text-stone-500 hover:text-[#A35E47] transition-colors">
                Forgot password?
              </Link>
            </div>
            <AuthError message={error} />
            <AuthButton loading={isLoading}>Sign in</AuthButton>
            <button
              type="button"
              onClick={() => { setStep(1); setError(null); }}
              className="text-center text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Use a different account
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <div className="w-6 h-6 border-2 border-[#A35E47]/30 border-t-[#A35E47] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
