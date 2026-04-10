'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePerFinStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { formatINR } from '@/lib/utils';
import { deleteProfileData, exportProfileData } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  BarChart2, 
  ArrowUpRight, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  PieChart, 
  Shield, 
  Lightbulb, 
  ChevronRight,
  TrendingDown,
  Activity,
  User,
  LogOut,
  Edit3,
  Target, AlertCircle, Zap, Receipt
} from 'lucide-react';

const OLIVE = '#A35E47';
const DEEP  = '#000000';
const SAGE  = '#B57A68';
const LIGHT = '#E8DEDC';
const BG    = '#FAFAFA';
const CARD  = '#FFFFFF';
const CARD2 = '#F0F0F0';
const BORDER= '#9C9A9A';
const SEC   = '#464646';
const MUTED = '#9C9A9A';
const DANGER= '#8B3A2A';

function ScoreArc({ score }) {
  const color = score >= 75 ? OLIVE : score >= 50 ? SAGE : DANGER;
  return (
    <div style={{ position: 'relative', width: 148, height: 148, margin: '0 auto 18px' }}>
      <svg viewBox="0 0 160 160" width={148} height={148}>
        <circle cx="80" cy="80" r="64" fill="none" stroke={BORDER} strokeWidth="10" />
        <circle cx="80" cy="80" r="64" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${(score / 100) * 402} 402`} strokeLinecap="round" transform="rotate(-90 80 80)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 32, fontWeight: 700, color }}>{Math.round(score)}</span>
        <span style={{ fontSize: 10, color: MUTED }}>/100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { analysis } = usePerFinStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    usePerFinStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(usePerFinStore.persist.hasHydrated());
  }, []);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => { 
    if (hasHydrated && isAuthenticated && !analysis) router.push('/input'); 
  }, [analysis, hasHydrated, isAuthenticated, router]);

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteData = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This will erase your email, financial data, and profile. This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await deleteProfileData();
      usePerFinStore.getState().reset();
      useAuthStore.getState().logout();
      window.location.href = '/';
    } catch (err) {
      console.error("Failed to delete account", err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportProfileData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `perfin_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export data", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!hasHydrated || !analysis) return null;

  const { health_score, monthly_surplus, net_worth, total_assets, total_liabilities, ai_summary, projections, insurance_advice, tax_advice, cibil_advice } = analysis;

  const scoreLabel = health_score.interpretation || (health_score.total >= 80 ? 'Excellent' : health_score.total >= 60 ? 'Good' : health_score.total >= 40 ? 'Needs Improvement' : 'Poor');
  const scoreColor = health_score.total >= 80 ? OLIVE : health_score.total >= 60 ? SAGE : health_score.total >= 40 ? '#8F7020' : DANGER;
  const projection2030 = projections.find(p => p.year === 2030);
  const projection2035 = projections.find(p => p.year === 2035);

  const metrics = [
    { icon: <Wallet size={17} />, label: 'Net Worth', value: formatINR(net_worth), sub: net_worth >= 0 ? '▲ On Track' : '▼ Below Zero', color: net_worth >= 0 ? OLIVE : DANGER },
    { icon: <TrendingUp size={17} />, label: 'Monthly Surplus', value: formatINR(monthly_surplus), sub: `${((monthly_surplus / analysis.monthly_income) * 100).toFixed(1)}% savings rate`, color: monthly_surplus >= 0 ? OLIVE : DANGER },
    { icon: <BarChart2 size={17} />, label: 'Total Assets', value: formatINR(total_assets), sub: 'Across all instruments', color: SAGE },
    { icon: <AlertCircle size={17} />, label: 'Total Liabilities', value: formatINR(total_liabilities), sub: `Debt ratio: ${total_liabilities > 0 ? ((total_liabilities / (analysis.monthly_income * 12)) * 100).toFixed(0) : 0}%`, color: total_liabilities > 0 ? '#8F7020' : OLIVE },
  ];

  const scoreBreakdown = [
    { label: 'Savings Rate', val: health_score.savings_rate_score, max: 25 },
    { label: 'Debt Ratio', val: health_score.debt_ratio_score, max: 25 },
    { label: 'Emergency Fund', val: health_score.emergency_fund_score, max: 25 },
    { label: 'Investment Mix', val: health_score.investment_score, max: 25 },
  ];

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6 };
  const label = { fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 };
  const div1px = { height: 1, background: BORDER, margin: '0' };

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 76 }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: DEEP, letterSpacing: '-0.02em', marginBottom: 3 }}>Hello, {analysis.name}</h1>
            <p style={{ color: MUTED, fontSize: 13 }}>Your financial health overview</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/input"><button className="btn-ghost" style={{ fontSize: 12 }}><Edit3 size={12} style={{ display: 'inline', marginRight: 4 }} />Edit Profile</button></Link>
            <Link href="/projection"><button className="btn-ghost" style={{ fontSize: 12 }}><BarChart2 size={12} style={{ display: 'inline', marginRight: 4 }} />Projection</button></Link>
            <Link href="/chat"><button className="btn-accent" style={{ fontSize: 12, padding: '7px 16px' }}><ArrowUpRight size={12} style={{ display: 'inline', marginRight: 4 }} />Ask AI</button></Link>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
          {metrics.map((m, i) => (
            <div key={i} className="hover-card" style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: m.color }}>{m.icon}<span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: MUTED }}>{m.label}</span></div>
              <div style={{ fontSize: 20, fontWeight: 700, color: DEEP, marginBottom: 3 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Advisor Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 12, marginBottom: 20 }}>
          {/* Insurance */}
          <div className="hover-card" style={{ ...card, padding: 20, borderLeft: `3px solid ${OLIVE}` }}>
            <div style={label}><Shield size={12} color={OLIVE} />Insurance Advice</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: SEC }}>Life Cover</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: DEEP }}>{formatINR(insurance_advice?.life_insurance_cover ?? 0)}</span>
            </div>
            <div style={{ ...div1px, marginBottom: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: SEC }}>Health Cover</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: DEEP }}>{insurance_advice?.health_insurance_cover}</span>
            </div>
            <p style={{ fontSize: 12, color: SEC, lineHeight: 1.6, fontStyle: 'italic' }}>"{insurance_advice?.advice}"</p>
          </div>

          {/* Credit */}
          <div className="hover-card" style={{ ...card, padding: 20, borderLeft: `3px solid ${BORDER}` }}>
            <div style={label}><CreditCard size={12} color={MUTED} />Credit Health</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 3 }}>Simulated CIBIL</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: DEEP }}>{cibil_advice?.score}</div>
              </div>
              <span style={{ 
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, 
                background: cibil_advice?.status === 'Excellent' ? `${OLIVE}18` : cibil_advice?.status === 'Good' ? `${SAGE}18` : 'rgba(143,158,88,0.15)',
                color: cibil_advice?.status === 'Excellent' ? OLIVE : cibil_advice?.status === 'Good' ? SAGE : '#464646'
              }}>{cibil_advice?.status}</span>
            </div>
            
            {/* Breakdown Bars */}
            {cibil_advice?.breakdown && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: 14 }}>
                {[
                  { lbl: 'Payment History', val: cibil_advice.breakdown.payment, max: 35 },
                  { lbl: 'Credit Utilisation', val: cibil_advice.breakdown.utilization, max: 30 },
                  { lbl: 'History Length', val: cibil_advice.breakdown.history, max: 15 },
                  { lbl: 'Credit Mix', val: cibil_advice.breakdown.mix, max: 10 },
                  { lbl: 'New Enquiries', val: cibil_advice.breakdown.new_credit, max: 10 },
                ].map(b => (
                  <div key={b.lbl}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: MUTED, marginBottom: 2 }}>
                      <span>{b.lbl}</span>
                      <span>{Math.round(b.val)}/{b.max}</span>
                    </div>
                    <div style={{ height: 3, background: CARD2, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(b.val / b.max) * 100}%`, background: SAGE }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ ...div1px, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Zap size={12} color={SAGE} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: SEC, lineHeight: 1.6 }}>{cibil_advice?.advice}</p>
            </div>
          </div>
        </div>

        {/* Emergency Fund */}
        {(() => {
          const monthlyExp = analysis.monthly_expenses;
          const target3 = monthlyExp * 3;
          const target6 = monthlyExp * 6;
          const saved = analysis.total_assets > 0
            ? Math.min(analysis.total_assets, target6)
            : 0;
          const pct = Math.min((saved / target6) * 100, 100);
          const met3 = saved >= target3;
          const met6 = saved >= target6;
          const statusLabel = met6 ? 'Fully Funded' : met3 ? '3-Month Met' : 'Under-funded';
          const statusColor = met6 ? OLIVE : met3 ? '#8F7020' : DANGER;
          const shortfall = Math.max(0, target6 - saved);
          return (
            <div className="hover-card" style={{ ...card, padding: 20, marginBottom: 20, borderLeft: `3px solid ${statusColor}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div style={label}><Zap size={12} color={statusColor} />Emergency Fund</div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4, background: `${statusColor}18`, color: statusColor }}>{statusLabel}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 14 }}>
                {[
                  { lbl: '3-Month Target', val: formatINR(target3), color: met3 ? OLIVE : DANGER },
                  { lbl: '6-Month Target', val: formatINR(target6), color: met6 ? OLIVE : '#8F7020' },
                  { lbl: 'Liquid Savings', val: formatINR(saved), color: DEEP },
                  { lbl: 'Shortfall', val: shortfall > 0 ? formatINR(shortfall) : '—', color: shortfall > 0 ? DANGER : OLIVE },
                ].map(({ lbl, val, color }) => (
                  <div key={lbl} style={{ background: BG, borderRadius: 5, padding: '10px 12px', border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 10, color: MUTED, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lbl}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED }}>
                <span>Progress to 6-month safety net</span>
                <span style={{ fontWeight: 700, color: statusColor }}>{pct.toFixed(0)}%</span>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: CARD2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })()}

        {/* Health Score + AI Summary */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>

          <div className="hover-card" style={{ ...card, flex: '1 1 270px', maxWidth: 320, padding: 22 }}>
            <div style={label}><Shield size={12} color={MUTED} />Health Score</div>
            <ScoreArc score={health_score.total} />
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 14px', borderRadius: 4, background: `${scoreColor}18`, color: scoreColor }}>{scoreLabel}</span>
            </div>
            {scoreBreakdown.map(s => (
              <div key={s.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: SEC }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: OLIVE }}>{s.val.toFixed(1)}/{s.max}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(s.val / s.max) * 100}%` }} /></div>
              </div>
            ))}
          </div>

          <div style={{ flex: '2 1 360px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="hover-card" style={{ ...card, padding: 22, flex: 1 }}>
              <div style={label}><div style={{ width: 6, height: 6, borderRadius: '50%', background: OLIVE }} />AI Analysis</div>
              <p style={{ color: SEC, lineHeight: 1.8, fontSize: 13 }}>{ai_summary}</p>
            </div>
            <div className="hover-card" style={{ ...card, padding: 20 }}>
              <div style={{ ...label, marginBottom: 14 }}>Projected Net Worth</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ year: 2030, val: projection2030?.net_worth }, { year: 2035, val: projection2035?.net_worth }].map(p => (
                  <div key={p.year} style={{ flex: 1, background: BG, borderRadius: 5, padding: '12px', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: OLIVE }}>{formatINR(p.val ?? 0)}</div>
                    <div style={{ fontSize: 10, color: MUTED, marginTop: 3 }}>by {p.year}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <Link href="/projection" style={{ textDecoration: 'none' }}>
                  <button className="btn-accent" style={{ width: '100%', fontSize: 12, padding: '9px' }}>View Full Projection →</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Goals */}
        {analysis.goals.length > 0 && (
          <div className="hover-card" style={{ ...card, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={label}><Target size={12} color={MUTED} />Goal Snapshot</div>
              <Link href="/goals"><button className="btn-ghost" style={{ fontSize: 11 }}>View All →</button></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
              {analysis.goals.map((g, i) => (
                <div key={i} className="hover-card" style={{ padding: 14, borderRadius: 5, background: BG, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontWeight: 600, marginBottom: 5, fontSize: 13, color: DEEP }}>{g.goal_type}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: OLIVE, marginBottom: 3 }}>{formatINR(g.target_amount)}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{g.time_horizon_years} years</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: g.feasibility === 'Achievable' ? 'rgba(99,107,47,0.12)' : 'rgba(143,158,88,0.15)', color: g.feasibility === 'Achievable' ? '#3A4A18' : '#464646' }}>{g.feasibility}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy & Control */}
        <div style={{ ...card, padding: 22, marginTop: 20, background: 'rgba(139,58,42,0.03)', border: `1px solid ${DANGER}40` }}>
          <div style={{ ...label, color: DANGER }}><Shield size={12} color={DANGER} />Permanently Delete Account</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
            <p style={{ fontSize: 12, color: SEC, maxWidth: 600 }}>
              Your financial data and account are private. You can choose to permanently remove your entire account (including your email and all profile analysis) from our servers at any time.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={handleExportData}
                disabled={isExporting}
                style={{ 
                  background: OLIVE, 
                  color: BG, 
                  border: 'none', 
                  borderRadius: 5, 
                  padding: '8px 16px', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  opacity: isExporting ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {isExporting ? 'Exporting...' : 'Export My Data (JSON)'}
              </button>
              <button 
                onClick={handleDeleteData}
                disabled={isDeleting}
                style={{ 
                  background: 'transparent', 
                  color: DANGER, 
                  border: `1px solid ${DANGER}`, 
                  borderRadius: 5, 
                  padding: '8px 16px', 
                  fontSize: 11, 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(139,58,42,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                {isDeleting ? 'Deleting Account...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
