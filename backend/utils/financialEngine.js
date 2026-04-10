// -------- HELPERS --------
/**
 * Safely converts a value to a positive number.
 * Handles strings, nulls, and undefined by returning 0 if invalid.
 */
const safe = (val) => {
  if (val === null || val === undefined) return 0;
  // Strip commas if string
  const clean = typeof val === 'string' ? val.replace(/,/g, '') : val;
  const num = Number(clean);
  return !isNaN(num) && num > 0 ? num : 0;
};

// -------- BASIC CALCULATIONS --------
const calculateMonthlyExpenses = (profile) => {
  return (
    safe(profile.housing_expense) +
    safe(profile.food_expense) +
    safe(profile.transport_expense) +
    safe(profile.utilities_expense) +
    safe(profile.entertainment_expense) +
    safe(profile.other_expense) +
    safe(profile.monthly_loan_emi)
  );
};

const calculateTotalAssets = (profile) => {
  return (
    safe(profile.current_savings) +
    safe(profile.stocks) +
    safe(profile.mutual_funds) +
    safe(profile.gold) +
    safe(profile.crypto) +
    safe(profile.real_estate) +
    safe(profile.provident_fund)
  );
};

const calculateTotalLiabilities = (profile) => {
  return safe(profile.total_loans) + safe(profile.credit_card_debt);
};

const calculateNetWorth = (profile) => {
  return calculateTotalAssets(profile) - calculateTotalLiabilities(profile);
};

// -------- HEALTH SCORE --------
const calculateHealthScore = (profile) => {
  const monthlyIncome = safe(profile.monthly_income);
  const monthlyExpenses = calculateMonthlyExpenses(profile);
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  
  // Calculate total annual from sources if available, otherwise fallback to monthly * 12
  const annualIncome = (profile.incomes && Array.isArray(profile.incomes))
    ? profile.incomes.reduce((sum, inc) => sum + safe(inc.amount), 0)
    : monthlyIncome * 12;

  // 1. SAVINGS SCORE (Max 25)
  // SavingsRate = (Income - Expenses) / Income
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) : 0;
  const savingsScore = Math.min(25, Math.max(0, (savingsRate / 0.30) * 25));

  // 2. DEBT SCORE (Max 25)
  // DebtRatio = EMI / Income
  const monthlyEMI = safe(profile.monthly_loan_emi);
  const debtRatio = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) : 0;
  const debtScore = Math.max(0, 25 - (debtRatio / 0.50 * 25));

  // 3. EMERGENCY FUND SCORE (Max 25)
  // Months Covered = Savings / Monthly Expenses
  const currentSavings = safe(profile.current_savings);
  const monthsCovered = monthlyExpenses > 0 ? (currentSavings / monthlyExpenses) : 0;
  const emergencyScore = Math.min(25, (monthsCovered / 6) * 25);

  // 4. INVESTMENT SCORE (Max 25)
  // A. Diversification Score (Max 15)
  const assets = [
    safe(profile.stocks) > 0,
    safe(profile.mutual_funds) > 0,
    safe(profile.gold) > 0,
    safe(profile.real_estate) > 0,
    safe(profile.crypto) > 0,
    safe(profile.provident_fund) > 0
  ];
  const assetCount = assets.filter(Boolean).length;
  const diversificationScore = Math.min(15, (assetCount / 4) * 15);

  // B. Investment Ratio Score (Max 10)
  const totalInvestments = (
    safe(profile.stocks) +
    safe(profile.mutual_funds) +
    safe(profile.gold) +
    safe(profile.real_estate) +
    safe(profile.crypto) +
    safe(profile.provident_fund)
  );
  const investmentRatio = annualIncome > 0 ? (totalInvestments / annualIncome) : 0;
  const investmentRatioScore = Math.min(10, investmentRatio * 10);

  const investmentScore = diversificationScore + investmentRatioScore;

  // FINAL CALCULATION
  const total = savingsScore + debtScore + emergencyScore + investmentScore;

  return {
    savings_rate_score: Number(savingsScore.toFixed(1)),
    debt_ratio_score: Number(debtScore.toFixed(1)),
    emergency_fund_score: Number(emergencyScore.toFixed(1)),
    investment_score: Number(investmentScore.toFixed(1)),
    total: Number(total.toFixed(1)),
    interpretation: 
      total >= 80 ? "Excellent" : 
      total >= 60 ? "Good" : 
      total >= 40 ? "Needs Improvement" : "Poor"
  };
};

// -------- SIP CALCULATION --------
const calculateSipFutureValue = (monthlyInvestment, annualRate, years) => {
  if (monthlyInvestment <= 0 || years <= 0) return 0;

  const r = annualRate / 12;
  const n = years * 12;

  if (r === 0) return monthlyInvestment * n;

  return monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
};

// -------- PROJECTIONS --------
const calculateProjections = (profile, stepUpPercent = 0.05) => {
  const monthlyIncome = safe(profile.monthly_income);
  const monthlyExpenses = calculateMonthlyExpenses(profile);
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  // Initial monthly investment
  let currentMonthlyInvestment = Math.max(0, monthlySurplus * 0.7);

  // Risk-based return rates
  const risk = profile.risk_level || "medium";
  const returnMap = { low: 0.06, medium: 0.1, high: 0.12 };
  const annualReturn = returnMap[risk] || 0.1;

  const baseNetWorth = calculateNetWorth(profile);
  const currentYear = new Date().getFullYear();

  const projections = [];
  let cumulativeSipValue = 0;
  let totalInvested = 0;

  for (let y = 0; y <= 15; y++) {
    const year = currentYear + y;
    
    // The base net worth grows with compounding
    const grownBase = baseNetWorth * Math.pow(1 + annualReturn, y);
    
    projections.push({
      year,
      net_worth: Math.round(grownBase + cumulativeSipValue),
      invested: Math.round(totalInvested),
    });

    // Preparation for the next year
    // Every year, we add 12 months of contributions at the current rate
    // Then we compound the whole cumulative SIP value
    const annualContrib = currentMonthlyInvestment * 12;
    totalInvested += annualContrib;
    
    // Update SIP value: (Existing + New Year Contrib) Compounded
    cumulativeSipValue = (cumulativeSipValue + annualContrib) * (1 + annualReturn);

    // Apply Step-up for the next year's investment rate
    currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpPercent);
  }

  return projections;
};

// -------- GOAL PLANNING --------
const calculateGoalResult = (goal, profile) => {
  const annualReturn = 0.1; // Default 10% for goals
  const r = annualReturn / 12;
  const n = safe(goal.time_horizon_years) * 12;

  const targetAmount = safe(goal.target_amount);
  const currentSavings = safe(goal.current_savings_for_goal);
  
  const remaining = Math.max(0, targetAmount - currentSavings);

  let requiredSip = 0;

  if (n > 0 && r > 0) {
    requiredSip = (remaining * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  } else if (n > 0) {
    requiredSip = remaining / n;
  } else {
    requiredSip = remaining;
  }

  const projectedCorpus =
    currentSavings * Math.pow(1 + annualReturn, safe(goal.time_horizon_years)) +
    calculateSipFutureValue(
      safe(goal.monthly_investment),
      annualReturn,
      safe(goal.time_horizon_years)
    );

  const currentMonthly = safe(goal.monthly_investment);
  const shortfall = Math.max(0, requiredSip - currentMonthly);

  return {
    goal_type: goal.goal_type,
    target_amount: targetAmount,
    time_horizon_years: safe(goal.time_horizon_years),
    current_savings_for_goal: currentSavings,
    monthly_investment_needed: Math.round(requiredSip),
    current_monthly_investment: currentMonthly,
    feasibility: currentMonthly >= requiredSip ? "Achievable" : "Needs Adjustment",
    shortfall_monthly: Math.round(shortfall),
    projected_corpus: Math.round(projectedCorpus),
  };
};

// -------- ADVISORY LOGIC --------

const calculateInsuranceAdvice = (profile) => {
  const annualIncome = (profile.incomes && Array.isArray(profile.incomes))
    ? profile.incomes.reduce((sum, inc) => sum + safe(inc.amount), 0)
    : safe(profile.monthly_income) * 12;
  const lifeCover = annualIncome * 10;
  
  let healthCover, advice;
  if (safe(profile.dependents) > 0) {
    healthCover = "₹10L Family Floater";
    advice = "With dependents, a family floater plan is essential to cover everyone under one umbrella.";
  } else {
    healthCover = "₹5L Individual";
    advice = "An individual plan is sufficient for now, but ensure it includes critical illness cover.";
  }

  return {
    life_insurance_cover: lifeCover,
    health_insurance_cover: healthCover,
    advice: advice
  };
};

const calculateCibilAdvice = (profile) => {
  // Inputs from profile
  const paymentRatio = safe(profile.payment_ratio || 1); // Default to 100% if not specified
  const totalLimit = safe(profile.total_credit_limit);
  const usedCredit = safe(profile.credit_card_debt) + safe(profile.total_loans);
  const historyYears = safe(profile.credit_history_years);
  const hasSecured = !!profile.has_secured_loans;
  const hasUnsecured = !!profile.has_unsecured_loans;
  const recentInquiries = safe(profile.recent_inquiries);
  const manualScore = Number(profile.cibil_score);

  // If a valid manual score is provided (CIBIL is typically 300-900), use it.
  // We check for >= 300 to allow the simulation to run if the user leaves it as 0 or empty.
  if (!isNaN(manualScore) && manualScore >= 300) {
    return {
      score: Math.round(manualScore),
      status: manualScore >= 750 ? "Excellent" : manualScore >= 700 ? "Good" : manualScore >= 650 ? "Fair" : "Poor",
      advice: "Using your manually entered official CIBIL score for analysis.",
      breakdown: null
    };
  }

  // 1. PAYMENT HISTORY (Max 35)
  const paymentScore = Math.min(35, Math.max(0, paymentRatio * 35));

  // 2. CREDIT UTILIZATION (Max 30)
  const utilization = totalLimit > 0 ? (usedCredit / totalLimit) : (usedCredit > 0 ? 1 : 0);
  const utilScore = Math.max(0, 30 - (utilization * 30));

  // 3. CREDIT HISTORY LENGTH (Max 15)
  const historyScore = Math.min(15, (historyYears / 5) * 15);

  // 4. CREDIT MIX (Max 10)
  let mixScore = 0;
  if (hasSecured && hasUnsecured) mixScore = 10;
  else if (hasSecured || hasUnsecured) mixScore = 5;

  // 5. NEW CREDIT (Max 10)
  const newCreditScore = Math.max(0, 10 - (recentInquiries * 2));

  // FINAL CALCULATION (0-100)
  const totalSimulated = paymentScore + utilScore + historyScore + mixScore + newCreditScore;

  // Final CIBIL Score (300-900)
  const finalScore = Math.max(300, 300 + (totalSimulated / 100 * 600));

  let status, advice;
  if (finalScore >= 750) {
    status = "Excellent";
    advice = "Your credit health is outstanding. You qualify for the best interest rates.";
  } else if (finalScore >= 700) {
    status = "Good";
    advice = "Good score. Keep your utilization low to reach the 750+ range.";
  } else if (finalScore >= 650) {
    status = "Fair";
    advice = "Fair credit. Avoid new inquiries and ensure 100% on-time payments to improve.";
  } else {
    status = "Poor";
    advice = "Your credit needs attention. Focus on reducing debt and avoiding missed payments.";
  }

  return {
    score: Math.round(finalScore),
    status: status,
    advice: advice,
    breakdown: {
      payment: Number(paymentScore.toFixed(1)),
      utilization: Number(utilScore.toFixed(1)),
      history: Number(historyScore.toFixed(1)),
      mix: Number(mixScore.toFixed(1)),
      new_credit: Number(newCreditScore.toFixed(1))
    }
  };
};

// -------- TAX LOGIC --------

const calculateNewTax = (income) => {
  const taxable = Math.max(0, income - 75000); // Standard deduction
  if (income <= 700000) return 0; // Rebate under 87A

  let tax = 0;
  // FY 2024-25 updated slabs (New Regime)
  if (taxable > 300000) tax += Math.min(taxable - 300000, 400000) * 0.05; // 3-7L
  if (taxable > 700000) tax += Math.min(taxable - 700000, 300000) * 0.1;  // 7-10L
  if (taxable > 1000000) tax += Math.min(taxable - 1000000, 200000) * 0.15; // 10-12L
  if (taxable > 1200000) tax += Math.min(taxable - 1200000, 300000) * 0.2;  // 12-15L
  if (taxable > 1500000) tax += (taxable - 1500000) * 0.3;

  return tax * 1.04; // Plus 4% Cess
};

const calculateOldTax = (income, deductions) => {
  const taxable = Math.max(0, income - safe(deductions) - 50000); // Standard + 80C etc
  if (taxable <= 500000) return 0; // Rebate under 87A

  let tax = 0;
  if (taxable > 250000) tax += Math.min(taxable - 250000, 250000) * 0.05;
  if (taxable > 500000) tax += Math.min(taxable - 500000, 500000) * 0.2;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.3;

  return tax * 1.04; // Plus 4% Cess
};

const calculateTaxAdvice = (profile) => {
  const annualIncome = (profile.incomes && Array.isArray(profile.incomes))
    ? profile.incomes.reduce((sum, inc) => sum + safe(inc.amount), 0)
    : safe(profile.monthly_income) * 12;
  const oldTax = calculateOldTax(annualIncome, profile.total_deductions);
  const newTax = calculateNewTax(annualIncome);

  const recommendedRegime = newTax < oldTax ? "New Tax Regime" : "Old Tax Regime";
  const savings = Math.abs(oldTax - newTax);

  return {
    old_regime_tax: Math.round(oldTax),
    new_regime_tax: Math.round(newTax),
    recommended_regime: recommendedRegime,
    savings: Math.round(savings),
  };
};

// -------- FINAL EXPORT --------
module.exports = {
  safe,
  calculateMonthlyExpenses,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  calculateHealthScore,
  calculateProjections,
  calculateGoalResult,
  calculateInsuranceAdvice,
  calculateTaxAdvice,
  calculateCibilAdvice,
  calculateNewTax,
  calculateOldTax,
};
