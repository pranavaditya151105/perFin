'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerFinStore } from '@/lib/store';
import { formatINR } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { Target, CheckCircle, AlertTriangle, TrendingUp, Calendar, Plus, X, Save } from 'lucide-react';

const OLIVE = '#A35E47';
const DEEP  = '#000000';
const SAGE  = '#B57A68';
const BG    = '#FAFAFA';
const CARD  = '#FFFFFF';
const BORDER= '#9C9A9A';
const SEC   = '#464646';
const MUTED = '#9C9A9A';

import { useAuthStore } from '@/lib/auth-store';

export default function GoalsPage() {
  const router = useRouter();
  const { analysis, setAnalysis } = usePerFinStore();
  const { isAuthenticated, token } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'Luxury',
    target_amount: '',
    time_horizon_years: '',
    current_savings_for_goal: '0',
    monthly_investment: '0',
    priority: 'Medium'
  });

  useEffect(() => {
    usePerFinStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(usePerFinStore.persist.hasHydrated());
  }, []);

  useEffect(() => { 
    if (hasHydrated && isAuthenticated && !analysis) router.push('/input'); 
  }, [analysis, hasHydrated, isAuthenticated, router]);

  const handleAddGoal = async () => {
    if (!newGoal.target_amount || !newGoal.time_horizon_years) {
      alert("Please fill in Target Amount and Years.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Fetch current profile
      const profRes = await fetch('http://localhost:8000/api/analyze/profile/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profile = await profRes.json();

      // 2. Append new goal
      const updatedGoals = [...(profile.goals || []), {
        ...newGoal,
        target_amount: Number(newGoal.target_amount),
        time_horizon_years: Number(newGoal.time_horizon_years),
        current_savings_for_goal: Number(newGoal.current_savings_for_goal),
        monthly_investment: Number(newGoal.monthly_investment)
      }];

      const updatedProfile = { ...profile, goals: updatedGoals };

      // 3. Re-analyze and persist
      const analyzeRes = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });

      const newAnalysis = await analyzeRes.json();
      setAnalysis(newAnalysis);
      setIsAdding(false);
      setNewGoal({ goal_type: 'Luxury', target_amount: '', time_horizon_years: '', current_savings_for_goal: '0', monthly_investment: '0', priority: 'Medium' });
    } catch (err) {
      console.error("Failed to add goal:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasHydrated || !analysis) return null;

  const { goals } = analysis;
  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6 };
  const secLabel = { fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED };

  if (goals.length === 0) return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 76 }}>
      <Navbar />
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(99,107,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Target size={22} color={OLIVE} />
        </div>
        <h2 style={{ marginBottom: 8, color: DEEP, fontWeight: 600 }}>No goals yet</h2>
        <p style={{ color: SEC, marginBottom: 22, fontSize: 13 }}>Add goals in your financial profile to see planning details.</p>
        <button className="btn-accent" onClick={() => router.push('/input')}>Update Profile →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 76 }}>
      <Navbar />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: DEEP, letterSpacing: '-0.02em', marginBottom: 3 }}>Goal <span style={{ color: OLIVE }}>Planning</span></h1>
            <p style={{ color: MUTED, fontSize: 13 }}>Exact SIP amounts needed to achieve every financial goal</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: OLIVE, color: '#FFF', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={16} /> Add Goal
            </button>
          )}
        </div>

        {isAdding && (
          <div className="hover-card" style={{ ...card, padding: 24, marginBottom: 24, background: '#FFF7F5', borderColor: OLIVE }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: OLIVE }}>Create New Financial Target</h2>
              <button onClick={() => setIsAdding(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={secLabel}>Goal Type</label>
                <select 
                  value={newGoal.goal_type} 
                  onChange={e => setNewGoal({...newGoal, goal_type: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${BORDER}`, marginTop: 6, fontSize: 14 }}
                >
                  {['House', 'Car', 'Marriage', 'Education', 'Retirement', 'Travel', 'Luxury', 'Medical', 'Other'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={secLabel}>Target Amount (₹)</label>
                <input 
                  type="number" placeholder="5000000"
                  value={newGoal.target_amount} 
                  onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${BORDER}`, marginTop: 6, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={secLabel}>Time Horizon (Years)</label>
                <input 
                  type="number" placeholder="10"
                  value={newGoal.time_horizon_years} 
                  onChange={e => setNewGoal({...newGoal, time_horizon_years: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${BORDER}`, marginTop: 6, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={secLabel}>Priority</label>
                <select 
                  value={newGoal.priority} 
                  onChange={e => setNewGoal({...newGoal, priority: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: `1px solid ${BORDER}`, marginTop: 6, fontSize: 14 }}
                >
                  {['High', 'Medium', 'Low'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                disabled={isSaving}
                onClick={handleAddGoal}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: DEEP, color: '#FFF', border: 'none', borderRadius: 6, padding: '12px', fontSize: 14, fontWeight: 600, cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
              >
                {isSaving ? 'Calculating...' : <><Save size={18} /> Save & Recalculate Plan</>}
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Total Goals', val: goals.length },
            { label: 'Achievable', val: goals.filter(g => g.feasibility === 'Achievable').length },
            { label: 'Total Target', val: formatINR(goals.reduce((s, g) => s + g.target_amount, 0)) },
            { label: 'Monthly SIP', val: formatINR(goals.reduce((s, g) => s + g.monthly_investment_needed, 0)) },
          ].map((s, i) => (
            <div key={i} className="hover-card" style={{ ...card, padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 19, fontWeight: 700, color: OLIVE }}>{s.val}</div>
              <div style={{ ...secLabel, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Goal Cards */}
        <div style={{ display: 'grid', gap: 14 }}>
          {goals.map((g, i) => {
            const ok = g.feasibility === 'Achievable';
            const pct = Math.min(100, (g.current_savings_for_goal / g.target_amount) * 100);
            return (
              <div key={i} className="hover-card" style={{ ...card, padding: 22, borderLeft: `3px solid ${ok ? OLIVE : SAGE}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ok ? 'rgba(99,107,47,0.1)' : 'rgba(143,158,88,0.14)' }}>
                      {ok ? <CheckCircle size={19} color={OLIVE} /> : <AlertTriangle size={19} color={SAGE} />}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 600, color: DEEP }}>{g.goal_type}</h2>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, marginTop: 3, display: 'inline-block', background: ok ? 'rgba(99,107,47,0.1)' : 'rgba(143,158,88,0.15)', color: ok ? '#3A4A18' : '#464646' }}>{g.feasibility}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: OLIVE }}>{formatINR(g.target_amount)}</div>
                    <div style={{ fontSize: 11, color: MUTED, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 3 }}><Calendar size={10} /> {g.time_horizon_years} years</div>
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: MUTED }}>Current progress</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: OLIVE }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                  {[
                    { icon: <TrendingUp size={12} />, label: 'Required Monthly SIP', val: formatINR(g.monthly_investment_needed), color: OLIVE },
                    { icon: <TrendingUp size={12} />, label: 'Current Monthly SIP', val: formatINR(g.current_monthly_investment), color: SEC },
                    { icon: <Target size={12} />, label: 'Projected Corpus', val: formatINR(g.projected_corpus), color: OLIVE },
                    ...(!ok ? [{ icon: <AlertTriangle size={12} />, label: 'Monthly Shortfall', val: `+${formatINR(g.shortfall_monthly)}`, color: SAGE }] : []),
                  ].map((m, j) => (
                    <div key={j} className="hover-card" style={{ background: BG, borderRadius: 5, padding: '11px', border: `1px solid ${BORDER}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, color: MUTED }}>{m.icon}<span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{m.label}</span></div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{m.val}</div>
                    </div>
                  ))}
                </div>

                {!ok && (
                  <div style={{ marginTop: 14, padding: '9px 12px', borderRadius: 5, background: 'rgba(143,158,88,0.08)', border: `1px solid rgba(143,158,88,0.3)`, fontSize: 12, color: '#464646' }}>
                    Increase monthly SIP by <strong>{formatINR(g.shortfall_monthly)}</strong> to make this goal achievable on time.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
