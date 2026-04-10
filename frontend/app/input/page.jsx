'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeProfile, uploadFinancialDoc, fetchRawProfile } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useAuthStore } from '@/lib/auth-store';
import { usePerFinStore } from '@/lib/store';
import { User, DollarSign, PieChart, AlertCircle, Shield, Target, ChevronRight, ChevronLeft, Loader2, Upload, CheckCircle2 } from 'lucide-react';

const OLIVE = '#A35E47';
const DEEP  = '#000000';
const BG    = '#FAFAFA';
const CARD  = '#FFFFFF';
const CARD2 = '#F0F0F0';
const BORDER= '#9C9A9A';
const SEC   = '#464646';
const MUTED = '#9C9A9A';

const STEPS = ['Personal Info', 'Income & Expenses', 'Assets', 'Liabilities', 'Credit & Tax', 'Goals'];

const defaultProfile = {
  name: '', age: '', occupation: '', location: '', marital_status: 'Single',
  incomes: [{ label: 'Primary Salary', amount: '' }],
  monthly_income: '',
  housing_expense: '', food_expense: '', transport_expense: '',
  utilities_expense: '', entertainment_expense: '', other_expense: '',
  current_savings: '', stocks: '', mutual_funds: '', provident_fund: '',
  gold: '', crypto: '', real_estate: '',
  total_loans: '', credit_card_debt: '', monthly_loan_emi: '',
  dependents: '', existing_insurance: '', total_deductions: '',
  cibil_score: 750, credit_utilization: '',
  total_credit_limit: '', payment_ratio: 1, credit_history_years: '',
  has_secured_loans: false, has_unsecured_loans: false, recent_inquiries: 0,
  goals: [{ goal_type: 'House', target_amount: '', time_horizon_years: '', current_savings_for_goal: '', monthly_investment: '', priority: 'Medium' }],
};

const FIELD_HELP = {
  monthly_income: "The amount you earn every month after tax (take-home salary).",
  housing_expense: "Rent, home loan EMIs, and maintenance costs.",
  food_expense: "Groceries, dining out, and online food orders.",
  transport_expense: "Fuel, public transport, and vehicle maintenance.",
  utilities_expense: "Electricity, water, internet, and mobile bills.",
  entertainment_expense: "Movies, OTT subscriptions, and outings.",
  other_expense: "Shopping, personal care, and miscellaneous costs.",
  current_savings: "Cash, FD, and Bank balance available for use.",
  stocks: "Current market value of your direct equity investments.",
  mutual_funds: "Current value of all your mutual fund SIPs and lumpsums.",
  provident_fund: "Employee Provident Fund (EPF) and VPF balance.",
  gold: "Market value of physical gold or digital gold holdings.",
  crypto: "Current value of all your cryptocurrency holdings.",
  real_estate: "Market value of non-primary residential properties or land.",
  total_loans: "Sum of all outstanding loans (Home, Personal, Car).",
  credit_card_debt: "Total outstanding balance across all your credit cards.",
  monthly_loan_emi: "The total monthly payment you make towards all debts.",
  existing_insurance: "Total life and health insurance coverage you have.",
  total_credit_limit: "Sum of limits on all your credit cards (affects utilization).",
  payment_ratio: "Percentage of bills paid on time (1.0 = 100%).",
  credit_history_years: "Age of your oldest active credit account.",
  recent_inquiries: "Number of credit applications in the last 6 months.",
  cibil_score: "Official score (300-900) or we will simulate one for you."
};

/** Format a raw numeric string into Indian comma notation for display */
function toINRDisplay(val) {
  if (val === '' || val === null || val === undefined) return '';
  const raw = String(val).replace(/,/g, '');
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  return num.toLocaleString('en-IN');
}

function InputGroup({ label, name, value, onChange, type = 'number', prefix = '₹', placeholder = '0' }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isINR = prefix === '₹';
  const helpText = FIELD_HELP[name];

  // Show formatted value when not focused, raw when typing
  const displayValue = isINR && !focused ? toINRDisplay(value) : value;

  const handleChange = (e) => {
    if (isINR) {
      // Strip commas before bubbling up so parent state stays clean
      const stripped = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
      const syntheticEvent = {
        ...e,
        target: { ...e.target, name, value: stripped }
      };
      onChange(syntheticEvent);
    } else {
      onChange(e);
    }
  };

  const showHelp = helpText && (focused || hovered);

  return (
    <div 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <label className="input-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED, fontSize: 13, pointerEvents: 'none' }}>{prefix}</span>}
        <input
          className="input-field"
          type={isINR ? 'text' : type}
          inputMode={isINR ? 'numeric' : undefined}
          name={name}
           value={displayValue}
           onChange={handleChange}
           onFocus={(e) => { setFocused(true); e.target.select(); }}
           onBlur={() => setFocused(false)}
           onWheel={(e) => (e.target).blur()}
          placeholder={placeholder}
          style={{ paddingLeft: prefix ? 26 : 14 }}
        />
      </div>
      
      {/* Tooltip-style help text */}
      <div style={{
        height: showHelp ? 'auto' : 0,
        opacity: showHelp ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        marginTop: showHelp ? 6 : 0,
      }}>
        <div style={{
          fontSize: 11,
          color: OLIVE,
          background: 'rgba(163,94,71,0.08)',
          padding: '6px 10px',
          borderRadius: 4,
          borderLeft: `2px solid ${OLIVE}`,
          lineHeight: 1.4,
          fontStyle: 'italic'
        }}>
          {helpText}
        </div>
      </div>
    </div>
  );
}

function SelectGroup({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <select className="input-field" name={name} value={value} onChange={onChange}
        style={{ background: BG, color: DEEP }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function InputPage() {
  const router = useRouter();
  const { profile: storedProfile, setProfile, setAnalysis } = usePerFinStore();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [profile, setLocalProfile] = useState(defaultProfile);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    usePerFinStore.persist.onFinishHydration(() => setHasHydrated(true));
    setHasHydrated(usePerFinStore.persist.hasHydrated());
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (storedProfile) {
        setLocalProfile({
          ...storedProfile,
          incomes: storedProfile.incomes || [{ label: 'Primary Salary', amount: storedProfile.monthly_income ? String(Number(storedProfile.monthly_income)*12) : '' }]
        });
      } else if (hasHydrated && isAuthenticated) {
        try {
          const data = await fetchRawProfile();
          if (data) {
            const enriched = {
              ...data,
              incomes: data.incomes || [{ label: 'Primary Salary', amount: data.monthly_income ? String(Number(data.monthly_income)*12) : '' }]
            };
            setLocalProfile(enriched);
            setProfile(enriched);
          }
        } catch (err) {
          console.log("No profile on server yet", err);
        }
      }
    };
    loadProfile();
  }, [storedProfile, hasHydrated, isAuthenticated, setProfile]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtracting(true);
    setError('');
    setSyncSuccess(false);

    try {
      const data = await uploadFinancialDoc(file);
      const safeGet = (obj, path, fallback = 0) => {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        return (value === undefined || value === null) ? fallback : value;
      };

      setLocalProfile(prev => ({
        ...prev,
        // Map backend keys from the new nested structure (v2.0)
        incomes: [{ 
          label: 'Primary Salary (Auto-filled)', 
          amount: String((Number(safeGet(data, 'metrics.avg_monthly_income')) || 0) * 12) 
        }],
        monthly_income: String(Number(safeGet(data, 'metrics.avg_monthly_income')) || 0),
        
        housing_expense: (Number(safeGet(data, 'expenses.housing')) || 0) + (Number(prev.housing_expense) || 0) || prev.housing_expense,
        food_expense: (Number(safeGet(data, 'expenses.food')) || 0) + (Number(prev.food_expense) || 0) || prev.food_expense,
        transport_expense: (Number(safeGet(data, 'expenses.transport')) || 0) + (Number(prev.transport_expense) || 0) || prev.transport_expense,
        utilities_expense: (Number(safeGet(data, 'expenses.utilities')) || 0) + (Number(prev.utilities_expense) || 0) || prev.utilities_expense,
        entertainment_expense: (Number(safeGet(data, 'expenses.entertainment')) || 0) + (Number(prev.entertainment_expense) || 0) || prev.entertainment_expense,
        other_expense: (Number(safeGet(data, 'expenses.others')) || 0) + (Number(prev.other_expense) || 0) || prev.other_expense,
        
        // Assets Mapping (Using the new 'current_savings' metric - taking the latest closing balance)
        current_savings: (Number(safeGet(data, 'metrics.current_savings')) || 0) + (Number(prev.current_savings) || 0) || prev.current_savings,
        stocks: (Number(safeGet(data, 'expenses.investments.stocks')) || 0) + (Number(prev.stocks) || 0) || prev.stocks,
        mutual_funds: (Number(safeGet(data, 'expenses.investments.mutual_funds')) || 0) + (Number(prev.mutual_funds) || 0) || prev.mutual_funds,
        crypto: (Number(safeGet(data, 'expenses.investments.crypto')) || 0) + (Number(prev.crypto) || 0) || prev.crypto,
        provident_fund: (Number(safeGet(data, 'expenses.investments.provident_fund')) || 0) + (Number(prev.provident_fund) || 0) || prev.provident_fund,
        
        // Liabilities Mapping
        monthly_loan_emi: (Number(safeGet(data, 'metrics.total_deductions')) || 0) + (Number(prev.monthly_loan_emi) || 0) || prev.monthly_loan_emi,
        
        name: data.name || prev.name,
      }));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err) {
      console.error("Extraction failed", err);
      if (err.response?.status === 429) {
        setError("API Limit reached. If you're using a digital PDF, try again now (we'll use Groq). If it's a photo, please wait 1 minute.");
      } else {
        setError("AI was unable to read the document. Please ensure it's a clear PDF or image.");
      }
    } finally {
      setExtracting(false);
    }
  };

  const calculateLiveTax = () => {
    const safeNum = (v) => (!isNaN(Number(v)) && Number(v) > 0 ? Number(v) : 0);
    const annualIncome = safeNum(profile.monthly_income) * 12;
    const deductions = safeNum(profile.total_deductions);

    const calculateNew = (inc) => {
      const taxable = Math.max(0, inc - 75000);
      if (inc <= 700000) return 0;
      let tax = 0;
      if (taxable > 300000) tax += Math.min(taxable - 300000, 400000) * 0.05; // 3-7L
      if (taxable > 700000) tax += Math.min(taxable - 700000, 300000) * 0.1;  // 7-10L
      if (taxable > 1000000) tax += Math.min(taxable - 1000000, 200000) * 0.15; // 10-12L
      if (taxable > 1200000) tax += Math.min(taxable - 1200000, 300000) * 0.2;  // 12-15L
      if (taxable > 1500000) tax += (taxable - 1500000) * 0.3;
      return tax * 1.04;
    };

    const calculateOld = (inc, ded) => {
      const taxable = Math.max(0, inc - ded - 50000);
      if (taxable <= 500000) return 0;
      let tax = 0;
      if (taxable > 250000) tax += Math.min(taxable - 250000, 250000) * 0.05;
      if (taxable > 500000) tax += Math.min(taxable - 500000, 500000) * 0.2;
      if (taxable > 1000000) tax += (taxable - 1000000) * 0.3;
      return tax * 1.04;
    };

    const newTax = calculateNew(annualIncome);
    const oldTax = calculateOld(annualIncome, deductions);
    const recommended = newTax < oldTax ? 'New Regime' : 'Old Regime';
    
    // Optimization Target: Max 80C (1.5L)
    const potentialOldTax = calculateOld(annualIncome, 150000);
    const moreToInvest = Math.max(0, 150000 - deductions);
    const potentialSavings = Math.min(newTax, oldTax) - potentialOldTax;

    return { 
      newTax, 
      oldTax, 
      recommended, 
      minimal: Math.min(newTax, oldTax), 
      savings: Math.abs(newTax - oldTax),
      potential: {
        tax: potentialOldTax,
        savings: potentialSavings,
        investmentNeeded: moreToInvest
      }
    };
  };

  const taxPreview = calculateLiveTax();

  const update = (e) => {
    const { name, value, type } = e.target;
    // For numbers, we keep them in the local state to allow empty strings and handle leading zeros naturally
    setLocalProfile(prev => {
      const newProfile = { ...prev, [name]: type === 'number' ? value : value };
      
      // If we updated income relevant fields, re-derive monthly_income if needed? 
      // Actually, it's better to calculate monthly_income as a sum of annual incomes / 12 and keep it in sync.
      return newProfile;
    });
  };

  const [focusedIncome, setFocusedIncome] = useState(null); // { index: number, field: string }

  const updateIncome = (i, field, value) => {
    let cleaned = value;
    if (field === 'amount') {
      cleaned = value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    }
    setLocalProfile(prev => {
      const incomes = [...prev.incomes];
      incomes[i] = { ...incomes[i], [field]: cleaned };
      
      // Calculate total annual and update monthly_income
      const totalAnnual = incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
      return { 
        ...prev, 
        incomes, 
        monthly_income: String(Math.round(totalAnnual / 12)) 
      };
    });
  };

  const addIncomeSource = () => setLocalProfile(prev => ({
    ...prev,
    incomes: [...prev.incomes, { label: '', amount: '' }]
  }));

  const removeIncomeSource = (i) => setLocalProfile(prev => {
    const incomes = prev.incomes.filter((_, idx) => idx !== i);
    const totalAnnual = incomes.reduce((sum, inc) => sum + (Number(inc.amount) || 0), 0);
    return { 
      ...prev, 
      incomes, 
      monthly_income: String(Math.round(totalAnnual / 12)) 
    };
  });

  const updateGoal = (i, field, value) => {
    let cleaned = value;
    if (typeof value === 'string' && field !== 'goal_type' && field !== 'priority') {
      cleaned = value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    }
    setLocalProfile(prev => {
      const goals = [...prev.goals];
      goals[i] = { ...goals[i], [field]: cleaned };
      return { ...prev, goals };
    });
  };

  const addGoal = () => setLocalProfile(prev => ({
    ...prev,
    goals: [...prev.goals, { goal_type: '', target_amount: '', time_horizon_years: '', current_savings_for_goal: '', monthly_investment: '', priority: 'Medium' }],
  }));

  const removeGoal = (i) => setLocalProfile(prev => ({ ...prev, goals: prev.goals.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      // Coerce every field: numeric strings (including empty) → number, others stay string
      const toNum = (v) => (v === '' || v === null || v === undefined) ? 0 : Number(v);

      const sanitized = { ...profile };
      const numericTopFields = [
        'age', 'monthly_income',
        'housing_expense', 'food_expense', 'transport_expense',
        'utilities_expense', 'entertainment_expense', 'other_expense',
        'current_savings', 'stocks', 'mutual_funds', 'gold', 'crypto', 'real_estate', 'provident_fund',
        'total_loans', 'credit_card_debt', 'monthly_loan_emi',
        'dependents', 'existing_insurance', 'total_deductions',
        'cibil_score', 'credit_utilization',
        'total_credit_limit', 'payment_ratio', 'credit_history_years', 'recent_inquiries',
      ];
      numericTopFields.forEach(k => { sanitized[k] = toNum(sanitized[k]); });

      sanitized.goals = (sanitized.goals).map((g) => ({
        ...g,
        target_amount: toNum(g.target_amount),
        time_horizon_years: toNum(g.time_horizon_years),
        current_savings_for_goal: toNum(g.current_savings_for_goal),
        monthly_investment: toNum(g.monthly_investment),
      }));

      sanitized.incomes = (sanitized.incomes).map((inc) => ({
        ...inc,
        amount: toNum(inc.amount)
      }));

      setProfile(sanitized);
      const result = await analyzeProfile(sanitized);
      setAnalysis(result);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to backend. Make sure the backend server is running on port 8000.');
    } finally { setLoading(false); }
  };

  const stepIcons = [<User size={13} />, <DollarSign size={13} />, <PieChart size={13} />, <AlertCircle size={13} />, <Shield size={13} />, <Target size={13} />];
  const secHead = { fontWeight: 600, marginBottom: 14, color: MUTED, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' };

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 76 }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src="/profile.png" 
            alt="Profile" 
            style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              border: `2px solid ${OLIVE}`,
              marginBottom: 16,
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(163,94,71,0.15)'
            }} 
          />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: DEEP, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Build Your <span style={{ color: OLIVE }}>Financial Profile</span>
          </h1>
          {/* <p style={{ color: MUTED, fontSize: 13 }}>Fill in your details · Takes about 2 minutes</p> */}
        </div>

        {/* Wealth Sync Card */}
        <div className="hover-card" style={{ 
          background: 'rgba(163,94,71,0.04)', 
          border: `1px dashed ${OLIVE}`, 
          borderRadius: 8, 
          padding: '24px', 
          marginBottom: 28, 
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ background: OLIVE, color: BG, padding: 10, borderRadius: '50%' }}>
              {syncSuccess ? <CheckCircle2 size={24} /> : <Upload size={24} />}
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: DEEP, marginBottom: 4 }}>
                {syncSuccess ? 'Wealth Synced Successfully!' : 'Instant Wealth Sync'}
              </h2>
              <p style={{ fontSize: 12, color: SEC, maxWidth: 400, margin: '0 auto' }}>
                Upload your bank statement or salary slip in Excel and let PerFin auto-fill the boring stuff for you.
              </p>
            </div>

            <label style={{ 
              marginTop: 8,
              background: OLIVE,
              color: BG,
              padding: '10px 24px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: extracting ? 'not-allowed' : 'pointer',
              opacity: extracting ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.1s active'
            }}>
              {extracting ? (
                <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Reading Document...</>
              ) : (
                'Upload Financial Document'
              )}
              <input type="file" hidden accept=".pdf,image/*" onChange={handleFileUpload} disabled={extracting} />
            </label>

            {syncSuccess && (
              <p style={{ fontSize: 11, color: OLIVE, fontWeight: 700 }}>
                Done! We've updated your assets, income, and EMIs.
              </p>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setStep(i)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 4, border: 'none',
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              background: i === step ? OLIVE : i < step ? 'rgba(99,107,47,0.18)' : CARD,
              color: i === step ? BG : i < step ? OLIVE : MUTED,
            }}>
              {stepIcons[i]} {s}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: 24 }}>
          <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {/* Card */}
        <div className="hover-card" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 28, marginBottom: 18 }}>

          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2"><InputGroup label="Full Name" name="name" value={profile.name} onChange={update} type="text" prefix="" placeholder="Name" /></div>
              <InputGroup label="Age" name="age" value={profile.age} onChange={update} prefix="" placeholder="Age" />
              <InputGroup label="Occupation" name="occupation" value={profile.occupation} onChange={update} type="text" prefix="" placeholder="Occupation" />
              <InputGroup label="City" name="location" value={profile.location} onChange={update} type="text" prefix="" placeholder="City" />
              <SelectGroup label="Marital Status" name="marital_status" value={profile.marital_status} onChange={update} options={['Single', 'Married', 'Divorced', 'Widowed']} />
              <InputGroup label="Dependents" name="dependents" value={profile.dependents} onChange={update} prefix="" placeholder="Number of dependents" />
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <p style={secHead}>Annual Income Sources</p>
                <p style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>Enter your gross annual income (pre-tax). We will estimate the tax for you.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {profile.incomes.map((inc, i) => (
                    <div key={i} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'minmax(120px, 1fr) 1fr auto', 
                      gap: 10, 
                      alignItems: 'end',
                      background: 'rgba(0,0,0,0.02)',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid rgba(0,0,0,0.04)'
                    }}>
                      <div>
                        <label className="input-label" style={{ fontSize: 10 }}>Source Name</label>
                        <input 
                          className="input-field" 
                          value={inc.label} 
                          onChange={e => updateIncome(i, 'label', e.target.value)}
                          placeholder="Salary, Rent, etc."
                          style={{ height: 38, fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label className="input-label" style={{ fontSize: 10 }}>Annual Amount (₹)</label>
                        <input 
                          className="input-field" 
                          value={focusedIncome?.index === i && focusedIncome?.field === 'amount' ? inc.amount : toINRDisplay(inc.amount)} 
                          onChange={e => updateIncome(i, 'amount', e.target.value)}
                          onFocus={() => setFocusedIncome({ index: i, field: 'amount' })}
                          onBlur={() => setFocusedIncome(null)}
                          placeholder="0"
                          style={{ height: 38, fontSize: 13 }}
                        />
                      </div>
                      {profile.incomes.length > 1 && (
                        <button 
                          onClick={() => removeIncomeSource(i)}
                          style={{ 
                            background: 'rgba(139,58,42,0.1)', 
                            color: '#8B3A2A', 
                            border: 'none', 
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            marginBottom: 5
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn-ghost" 
                  onClick={addIncomeSource}
                  style={{ width: '100%', borderStyle: 'dashed', marginTop: 12, fontSize: 12, padding: '8px' }}
                >
                  + Add Another Income Source
                </button>

                {Number(profile.monthly_income) > 0 && (
                  <div style={{ marginTop: 20, padding: 12, background: 'rgba(163,94,71,0.08)', borderRadius: 8, borderLeft: `3px solid ${OLIVE}` }}>
                    <p style={{ fontSize: 13, color: DEEP, fontWeight: 600 }}>
                      Total Annual Income: ₹{profile.incomes.reduce((s, i) => s + (Number(i.amount)||0), 0).toLocaleString('en-IN')}
                    </p>
                    <p style={{ fontSize: 11, color: OLIVE, marginTop: 2 }}>
                      Monthly Take-home (Estimated): ₹{Number(profile.monthly_income).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2"><p style={secHead}>Monthly Expenses</p></div>
               <InputGroup label="Housing / Rent" name="housing_expense" value={profile.housing_expense} onChange={update} placeholder="Amount" />
              <InputGroup label="Food & Groceries" name="food_expense" value={profile.food_expense} onChange={update} placeholder="Amount" />
              <InputGroup label="Transport" name="transport_expense" value={profile.transport_expense} onChange={update} placeholder="Amount" />
              <InputGroup label="Utilities" name="utilities_expense" value={profile.utilities_expense} onChange={update} placeholder="Amount" />
              <InputGroup label="Entertainment" name="entertainment_expense" value={profile.entertainment_expense} onChange={update} placeholder="Amount" />
              <InputGroup label="Other Expenses" name="other_expense" value={profile.other_expense} onChange={update} placeholder="Amount" />
              <div className="md:col-span-2"><InputGroup label="Annual Tax Deductions (80C, etc.)" name="total_deductions" value={profile.total_deductions} onChange={update} placeholder="Amount" /></div>
              
              {/* Live Tax Preview Card */}
              <div className="md:col-span-2" style={{ 
                marginTop: 12, 
                padding: 20, 
                borderRadius: 8, 
                background: 'rgba(163,94,71,0.06)', 
                border: `1px solid ${OLIVE}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: OLIVE, color: '#FFF', padding: 8, borderRadius: 6 }}>
                    <Shield size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: DEEP }}>Live Tax Calculator</h3>
                    <p style={{ fontSize: 11, color: SEC }}>Estimating based on FY 2024-25 slabs</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Annual Liability</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: DEEP }}>
                      ₹{taxPreview.minimal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Best Option</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: OLIVE }}>
                      {taxPreview.recommended}
                    </p>
                  </div>
                </div>
                
                {taxPreview.savings > 0 && (
                  <div style={{ 
                    padding: '8px 12px', 
                    background: '#FFF', 
                    borderRadius: 4, 
                    fontSize: 12, 
                    color: SEC,
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    ✨ You save <strong style={{color: OLIVE}}>₹{Math.round(taxPreview.savings).toLocaleString('en-IN')}</strong> by {taxPreview.savings > 0 ? `staying in the ${taxPreview.recommended}` : 'your current choice'}.
                  </div>
                )}

                {taxPreview.potential.savings > 1000 && taxPreview.potential.investmentNeeded > 0 && (
                  <div style={{ 
                    padding: '10px 14px', 
                    background: 'rgba(255,165,0,0.08)', 
                    borderRadius: 6, 
                    fontSize: 12, 
                    color: DEEP,
                    border: '1px dashed #FFA500',
                    lineHeight: '1.5'
                  }}>
                    🛡️ <strong>Tax Optimizer:</strong> You can reduce tax to <strong>₹{Math.round(taxPreview.potential.tax).toLocaleString('en-IN')}</strong> and save <strong>₹{Math.round(taxPreview.potential.savings).toLocaleString('en-IN')}</strong> more by investing <strong>₹{Math.round(taxPreview.potential.investmentNeeded).toLocaleString('en-IN')}</strong> more in 80C (Old Regime).
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Cash / Savings (FD, Bank)" name="current_savings" value={profile.current_savings} onChange={update} placeholder="Amount" />
              <InputGroup label="Provident Fund / EPF" name="provident_fund" value={profile.provident_fund} onChange={update} placeholder="Amount" />
              
              <InputGroup label="Stocks (Direct Equity)" name="stocks" value={profile.stocks} onChange={update} placeholder="Amount" />
              <InputGroup label="Mutual Funds" name="mutual_funds" value={profile.mutual_funds} onChange={update} placeholder="Amount" />
              
              <InputGroup label="Gold (Physical / Digital)" name="gold" value={profile.gold} onChange={update} placeholder="Amount" />
              <InputGroup label="Crypto" name="crypto" value={profile.crypto} onChange={update} placeholder="Amount" />
              
              <InputGroup label="Real Estate (Market Value)" name="real_estate" value={profile.real_estate} onChange={update} placeholder="Amount" />
              <InputGroup label="Existing Insurance Cover" name="existing_insurance" value={profile.existing_insurance} onChange={update} placeholder="Amount" />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Total Loans Outstanding" name="total_loans" value={profile.total_loans} onChange={update} placeholder="Amount" />
              <InputGroup label="Credit Card Debt" name="credit_card_debt" value={profile.credit_card_debt} onChange={update} placeholder="Amount" />
              <div className="md:col-span-2"><InputGroup label="Monthly EMI (Total)" name="monthly_loan_emi" value={profile.monthly_loan_emi} onChange={update} placeholder="Amount" /></div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2"><p style={secHead}>Credit Health (Score Simulator)</p></div>
              <InputGroup label="Total Credit Limit" name="total_credit_limit" value={profile.total_credit_limit} onChange={update} placeholder="Sum of all CC limits" />
              <InputGroup label="Payment History Ratio (0 to 1)" name="payment_ratio" value={profile.payment_ratio} onChange={update} prefix="" placeholder="1.0" />
              <InputGroup label="Credit History Length (Years)" name="credit_history_years" value={profile.credit_history_years} onChange={update} prefix="" placeholder="e.g. 5" />
              <InputGroup label="New Enquiries (Last 6mo)" name="recent_inquiries" value={profile.recent_inquiries} onChange={update} prefix="" placeholder="0" />
              
              <div className="md:col-span-2">
                <label className="input-label">Credit Mix</label>
                <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SEC, cursor: 'pointer' }}>
                    <input type="checkbox" checked={profile.has_secured_loans} onChange={e => setLocalProfile(p => ({...p, has_secured_loans: e.target.checked}))} style={{ accentColor: OLIVE }} />
                    Has Secured Loans (Home/Car)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: SEC, cursor: 'pointer' }}>
                    <input type="checkbox" checked={profile.has_unsecured_loans} onChange={e => setLocalProfile(p => ({...p, has_unsecured_loans: e.target.checked}))} style={{ accentColor: OLIVE }} />
                    Has Unsecured Loans (CC/Personal)
                  </label>
                </div>
              </div>

              <div className="md:col-span-2" style={{ marginTop: 10 }}>
                <p style={secHead}>Manual Override</p>
                <p style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>If you already know your official CIBIL score, you can enter it here. Otherwise, we will simulate it based on the data above.</p>
                <InputGroup label="Current CIBIL Score" name="cibil_score" value={profile.cibil_score} onChange={update} prefix="" placeholder="750" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              {profile.goals.map((g, i) => (
                <div key={i} className="hover-card" style={{ marginBottom: 20, padding: 18, borderRadius: 5, background: CARD2, border: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontWeight: 600, color: OLIVE, fontSize: 13 }}>Goal #{i + 1}</span>
                    {profile.goals.length > 1 && (
                      <button onClick={() => removeGoal(i)} style={{ background: 'none', border: 'none', color: '#8B3A2A', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Goal Name / Type</label>
                      <input 
                        className="input-field" 
                        list={`goal-types-${i}`}
                        value={g.goal_type} 
                        onChange={e => updateGoal(i, 'goal_type', e.target.value)}
                        placeholder="e.g. Dream House, New Car"
                      />
                      <datalist id={`goal-types-${i}`}>
                        {['House', 'Car', 'Retirement', 'Education', 'Travel', 'Wedding', 'Emergency Fund', 'Business'].map(o => <option key={o} value={o} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="input-label">Priority</label>
                      <select className="input-field" value={g.priority} onChange={e => updateGoal(i, 'priority', e.target.value)} style={{ background: BG, color: DEEP }}>
                        {['High', 'Medium', 'Low'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div><label className="input-label">Target Amount (₹)</label><input className="input-field" type="text" inputMode="numeric" value={toINRDisplay(g.target_amount)} onChange={e => updateGoal(i, 'target_amount', e.target.value)} placeholder="Amount" /></div>
                    <div><label className="input-label">Time Horizon (Years)</label><input className="input-field" type="number" value={g.time_horizon_years} onChange={e => updateGoal(i, 'time_horizon_years', e.target.value)} onWheel={(e) => (e.target).blur()} placeholder="Years" /></div>
                    <div><label className="input-label">Current Savings for Goal (₹)</label><input className="input-field" type="text" inputMode="numeric" value={toINRDisplay(g.current_savings_for_goal)} onChange={e => updateGoal(i, 'current_savings_for_goal', e.target.value)} placeholder="Amount" /></div>
                    <div><label className="input-label">Monthly Investment (₹)</label><input className="input-field" type="text" inputMode="numeric" value={toINRDisplay(g.monthly_investment)} onChange={e => updateGoal(i, 'monthly_investment', e.target.value)} placeholder="Amount" /></div>
                  </div>
                </div>
              ))}
              <button className="btn-ghost" onClick={addGoal} style={{ width: '100%', borderStyle: 'dashed' }}>+ Add Another Goal</button>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 5, background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.25)', color: '#8B3A2A', fontSize: 13, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <button className="btn-ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <ChevronLeft size={14} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn-accent" onClick={() => setStep(s => s + 1)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button className="btn-accent" onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 210, justifyContent: 'center' }}>
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : 'Generate Financial Plan →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
