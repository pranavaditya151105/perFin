'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { requestPasswordReset } from '../../lib/api';
import AuthShell from '../../components/AuthShell';

function AuthInput({ icon: Icon, type, placeholder, value, onChange, autoFocus }) {
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
        className="w-full bg-transparent text-white text-sm placeholder-stone-500 outline-none py-3.5 pl-11 pr-4"
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordReset(email);
      setMessage("Check your email for a reset code.");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your email to receive a recovery code"
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-[#A35E47] bg-[#A35E47]/10 border border-[#A35E47]/20 rounded-xl px-4 py-2.5">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: '#A35E47' }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Send Reset Code <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-stone-500 hover:text-stone-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </motion.form>
    </AuthShell>
  );
}
