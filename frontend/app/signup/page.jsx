'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Shield } from 'lucide-react';
import api, { getProfile, API_BASE_URL } from '../../lib/api';
import { useAuthStore } from '../../lib/auth-store';
import { usePerFinStore } from '../../lib/store';
import AuthShell from '../../components/AuthShell';

/* ─── Shared input ────────────────────────────────────────────────── */
function AuthInput({ icon: Icon, type, placeholder, value, onChange, autoFocus, rightSlot, style }) {
  return (
    <div
      className="relative flex items-center rounded-xl border transition-colors focus-within:border-[#A35E47]/80"
      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', ...style }}
    >
      {Icon && <Icon className="absolute left-4 w-4 h-4 text-stone-500 pointer-events-none" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        required
        className="w-full bg-transparent text-white text-sm placeholder-stone-500 outline-none py-3.5 pl-11 pr-11"
      />
      {rightSlot && <div className="absolute right-3">{rightSlot}</div>}
    </div>
  );
}

/* ─── OTP special input ───────────────────────────────────────────── */
function OtpInput({ value, onChange }) {
  return (
    <div
      className="relative flex items-center rounded-xl border transition-colors focus-within:border-[#A35E47]/80"
      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="• • • • • •"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        autoFocus
        required
        className="w-full bg-transparent text-white text-2xl font-bold tracking-[0.5em] placeholder-stone-700 outline-none py-4 text-center"
      />
    </div>
  );
}

/* ─── Error ───────────────────────────────────────────────────────── */
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

/* ─── Button ──────────────────────────────────────────────────────── */
function AuthButton({ children, loading, type = 'submit', onClick }) {
  return (
    <button
      type={type}
      disabled={loading}
      onClick={onClick}
      className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ background: loading ? '#7a463a' : '#A35E47' }}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>{children} <ArrowRight className="w-4 h-4" /></>
      )}
    </button>
  );
}

/* ─── Step metadata ───────────────────────────────────────────────── */
const STEPS = {
  EMAIL:    { n: 1, title: 'Create your account',        subtitle: 'Start your financial clarity journey' },
  OTP:      { n: 2, title: 'Verify your email',           subtitle: '' },
  PASSWORD: { n: 3, title: 'Set a strong password',       subtitle: 'Use 8+ characters with letters & numbers' },
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setAnalysis = usePerFinStore((s) => s.setAnalysis);

  const meta = STEPS[step];

  /* Send OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/otp/send-otp`, { email });
      setStep('OTP');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send verification code. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /* Verify OTP */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/otp/verify-otp`, { email, otp });
      setStep('PASSWORD');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  /* Finalize signup */
  const handleFinalizeSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/signup`, { email, password });
      const { data } = await api.post('auth/login', { email, password });
      usePerFinStore.getState().reset();
      setAuth({ id: 'temp-id', email }, data.access_token);
      try {
        const profile = await getProfile();
        setAnalysis(profile);
        router.push('/dashboard');
      } catch {
        router.push('/input');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title={meta.title}
      subtitle={step === 'OTP' ? `We sent a 6-digit code to ${email}` : meta.subtitle}
      step={meta.n}
      totalSteps={3}
    >
      <AnimatePresence mode="wait">

        {/* Step 1 — Email */}
        {step === 'EMAIL' && (
          <motion.form
            key="step-email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSendOtp}
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
            <p className="text-xs text-stone-500 leading-relaxed">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#A35E47] hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#A35E47] hover:underline">Privacy Policy</Link>.
            </p>
            <AuthError message={error} />
            <AuthButton loading={isLoading}>Continue</AuthButton>
            <div className="text-center text-sm text-stone-500">
              Already have an account?{' '}
              <Link href="/login" className="text-[#A35E47] hover:text-[#c07060] font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </motion.form>
        )}

        {/* Step 2 — OTP */}
        {step === 'OTP' && (
          <motion.form
            key="step-otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleVerifyOtp}
            className="flex flex-col gap-4"
          >
            <OtpInput value={otp} onChange={setOtp} />
            <p className="text-center text-sm text-stone-500">
              Didn&apos;t receive it?{' '}
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="text-[#A35E47] hover:text-[#c07060] font-medium transition-colors disabled:opacity-50"
              >
                Resend code
              </button>
            </p>
            <AuthError message={error} />
            <AuthButton loading={isLoading}>Verify</AuthButton>
            <button
              type="button"
              onClick={() => { setStep('EMAIL'); setError(null); setOtp(''); }}
              className="text-center text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Change email
            </button>
          </motion.form>
        )}

        {/* Step 3 — Password */}
        {step === 'PASSWORD' && (
          <motion.form
            key="step-password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleFinalizeSignup}
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
            <AuthInput
              icon={Shield}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <AuthError message={error} />
            <AuthButton loading={isLoading}>Create account</AuthButton>
            <button
              type="button"
              onClick={() => { setStep('OTP'); setError(null); }}
              className="text-center text-sm text-stone-500 hover:text-stone-300 transition-colors"
            >
              ← Back
            </button>
          </motion.form>
        )}

      </AnimatePresence>
    </AuthShell>
  );
}
