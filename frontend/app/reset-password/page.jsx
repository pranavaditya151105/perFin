'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../lib/api';
import AuthShell from '../../components/AuthShell';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code or failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Set New Password"
      subtitle={`Recovery code sent to ${email}`}
    >
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div
          className="relative flex items-center rounded-xl border transition-colors focus-within:border-[#A35E47]/80"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Key className="absolute left-4 w-4 h-4 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="6-digit Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full bg-transparent text-white text-sm placeholder-stone-500 outline-none py-3.5 pl-11 pr-4"
          />
        </div>

        <div
          className="relative flex items-center rounded-xl border transition-colors focus-within:border-[#A35E47]/80"
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <Lock className="absolute left-4 w-4 h-4 text-stone-500 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full bg-transparent text-white text-sm placeholder-stone-500 outline-none py-3.5 pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-stone-500 hover:text-stone-300 transition-colors p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-[#A35E47] bg-[#A35E47]/10 border border-[#A35E47]/20 rounded-xl px-4 py-2.5">
            Password reset successful! Redirecting to login...
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: '#A35E47' }}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>{success ? 'Success!' : 'Reset Password'} <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </motion.form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090909' }}>
        <div className="w-6 h-6 border-2 border-[#A35E47]/30 border-t-[#A35E47] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
