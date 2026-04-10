const { v4: uuidv4 } = require('uuid');
const { User } = require('../models/models');
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const debugLog = (msg) => {
  try {
    const logPath = 'c:\\Users\\ganes\\Downloads\\perFin-main_final\\perfin-main\\backend\\debug.log';
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
  } catch (err) {
    // Silence logger errors to prevent core logic failure
  }
};

const {
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
} = require('../utils/financialEngine');
const { getAISummary } = require('../utils/aiAdvisor');

const analyzeProfile = catchAsync(async (req, res) => {
  const profile = req.body;
  const currentUserId = req.user.id;

  // Core financial calculations
  const monthlyExpenses = calculateMonthlyExpenses(profile);
  const monthlySurplus = (profile.monthly_income || 0) - monthlyExpenses;
  const totalAssets = calculateTotalAssets(profile);
  const totalLiabilities = calculateTotalLiabilities(profile);
  const netWorth = calculateNetWorth(profile);
  const healthScore = calculateHealthScore(profile);
  const projections = calculateProjections(profile);
  
  let goalResults = [];
  if (profile.goals && Array.isArray(profile.goals)) {
    goalResults = profile.goals.map(g => calculateGoalResult(g, profile));
  }

  // Advisors
  const insuranceAdvice = calculateInsuranceAdvice(profile);
  const taxAdvice = calculateTaxAdvice(profile);
  const cibilAdvice = calculateCibilAdvice(profile);
  
  // Debug log for CIBIL logic issues
  if (typeof debugLog === 'function') {
    debugLog(`Analysis for ${profile.name}: CIBIL Score = ${cibilAdvice.score}, Status = ${cibilAdvice.status}`);
  }

  const aiSummary = await getAISummary(profile);

  const response = {
    user_id: currentUserId,
    name: profile.name,
    monthly_income: profile.monthly_income,
    monthly_expenses: monthlyExpenses,
    monthly_surplus: monthlySurplus,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: netWorth,
    health_score: healthScore,
    projections: projections,
    goals: goalResults,
    ai_summary: aiSummary,
    insurance_advice: insuranceAdvice,
    tax_advice: taxAdvice,
    cibil_advice: cibilAdvice,
  };

  // Persist to MongoDB
  await User.updateOne(
    { _id: currentUserId },
    {
      $set: {
        latest_analysis: response,
        profile: profile,
      },
    }
  );

  res.json(response);
});

const getMyAnalysis = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.latest_analysis) {
    throw new ApiError(404, "Analysis not found");
  }
  res.json(user.latest_analysis);
});

const getMyProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.profile) {
    throw new ApiError(404, "Profile not found");
  }
  res.json(user.profile);
});

const deleteAccount = catchAsync(async (req, res) => {
  await User.deleteOne({ _id: req.user.id });
  res.json({ message: "Account and all data deleted successfully" });
});

const exportAnalysis = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.latest_analysis) {
    throw new ApiError(404, "Analysis not found");
  }
  res.json({
    metadata: {
      version: "1.0",
      source: "PerFin AI",
      exported_at: uuidv4(),
    },
    data: user.latest_analysis,
  });
});

module.exports = {
  analyzeProfile,
  getMyAnalysis,
  getMyProfile,
  deleteAccount,
  exportAnalysis,
};
