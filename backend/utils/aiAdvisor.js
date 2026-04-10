const Groq = require('groq-sdk');
const { User, Goal, ChatHistory } = require('../models/models');
require('dotenv').config();

const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim().replace(/['"]/g, "");
const GROQ_MODEL = "llama-3.3-70b-versatile";

let groqClient = null;
if (GROQ_API_KEY && GROQ_API_KEY !== "your_groq_api_key_here") {
  groqClient = new Groq({ apiKey: GROQ_API_KEY });
}

const buildProfileContext = (profile) => {
  const monthlyExpenses = (
    (profile.housing_expense || 0) + (profile.food_expense || 0) + (profile.transport_expense || 0) +
    (profile.utilities_expense || 0) + (profile.entertainment_expense || 0) +
    (profile.other_expense || 0) + (profile.monthly_loan_emi || 0)
  );
  const surplus = (profile.monthly_income || 0) - monthlyExpenses;
  const totalAssets = (
    (profile.current_savings || 0) + (profile.stocks || 0) + (profile.mutual_funds || 0) +
    (profile.gold || 0) + (profile.crypto || 0) + (profile.real_estate || 0)
  );
  const totalLiabilities = (profile.total_loans || 0) + (profile.credit_card_debt || 0);
  const netWorth = totalAssets - totalLiabilities;
  const savingsRate = profile.monthly_income > 0 ? (surplus / profile.monthly_income) * 100 : 0;
  const emiToIncome = profile.monthly_income > 0 ? ((profile.monthly_loan_emi || 0) / profile.monthly_income) * 100 : 0;

  let goalsText = "";
  if (profile.goals && profile.goals.length > 0) {
    profile.goals.forEach(g => {
      goalsText += `\n  - ${g.goal_type}: Target ₹${(g.target_amount || 0).toLocaleString()} in ${g.time_horizon_years} years (Current: ₹${(g.current_savings_for_goal || 0).toLocaleString()})`;
    });
  }

  return `
User Financial Profile:
- Name: ${profile.name}, Age: ${profile.age}
- Monthly Income: ₹${(profile.monthly_income || 0).toLocaleString()}
- Monthly Expenses: ₹${monthlyExpenses.toLocaleString()}
- Monthly Surplus: ₹${surplus.toLocaleString()}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Debt (Total): ₹${totalLiabilities.toLocaleString()}
- Monthly EMI burden: ${emiToIncome.toFixed(1)}% of income
- Total Assets: ₹${totalAssets.toLocaleString()}
- Net Worth: ₹${netWorth.toLocaleString()}
- Assets Breakdown: Savings: ₹${(profile.current_savings || 0).toLocaleString()}, Stocks: ₹${(profile.stocks || 0).toLocaleString()}, Mutual Funds: ₹${(profile.mutual_funds || 0).toLocaleString()}, Gold: ₹${(profile.gold || 0).toLocaleString()}, Crypto: ₹${(profile.crypto || 0).toLocaleString()}, Real Estate: ₹${(profile.real_estate || 0).toLocaleString()}
- Tax Deductions (Annual 80C etc.): ₹${(profile.total_deductions || 0).toLocaleString()}
- Location: ${profile.location || "Not specified"}
- Goals: ${goalsText || "None specified"}
`.trim();
};

/**
 * Core AI calling function.
 * Accepts a ready-to-go messages array for maximum flexibility (memory support).
 */
const callAI = async (messages) => {
  if (!groqClient) {
    throw new Error("Groq API Key is missing or invalid. Please check your .env file.");
  }

  try {
    const chatCompletion = await groqClient.chat.completions.create({
      messages: messages,
      model: GROQ_MODEL,
    });
    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    throw new Error(`Groq API error: ${error.message}`);
  }
};

const getAISummary = async (profile) => {
  try {
    const context = buildProfileContext(profile);
    const systemPrompt = `You are an expert Indian personal finance advisor. Reference user figures for tailored advice. Concise 3-4 sentences on health, strengths, improvements, one actionable step. Use ₹, <150 words.`;
    
    return await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: context }
    ]);
  } catch (error) {
    return generateFallbackSummary(profile);
  }
};

const getChatResponse = async (userMessage, profile, history = []) => {
  try {
    const context = buildProfileContext(profile);
    const systemPrompt = `You are PerFin AI, an expert Indian income tax assistant helping users file their Income Tax Return (ITR) accurately and safely.
    
Your job is to guide the user step-by-step in collecting all required financial and personal details needed for filing ITR under Indian tax laws.

STRUCTURED FLOW:
1. Basic Details: Verify or ask for Full Name, PAN, Aadhaar (optional), Residential status, and Assessment Year.
2. Form Selection: Determine if user needs ITR-1, ITR-2, ITR-3, or ITR-4.
3. Income Collection: Salary (Form 16), Interest, Capital gains, Business/Freelance, and Rental income.
4. Deductions: Section 80C, 80D, 80E, HRA, LTA, etc.
5. Calculation: Calculate taxable income, compare Old vs New regime, and show liability.
6. Validation: Flag missing or inconsistent entries.
7. Output: Provide a clean ITR summary, final refund/payable amount, and step-by-step filing instructions for the official portal.

RULES:
- Reference user data from Context to avoid redundant questions.
- NEVER assume missing data.
- Scope: Indian finance/tax/investments only.
- Professional tone. Use ₹. Concise (<200 words).
- Disclaimer: You provide guidance, not a legal guarantee.

Context: ${context}`;

    // Build history-aware messages array
    const messages = [{ role: "system", content: systemPrompt }];
    
    // Inject conversation memory
    history.forEach(h => {
      messages.push({ role: "user", content: h.user });
      messages.push({ role: "assistant", content: h.ai });
    });

    // Add current message
    messages.push({ role: "user", content: userMessage });

    return await callAI(messages);
  } catch (error) {
    return `AI temporarily unavailable. Error: ${error.message.substring(0, 100)}. Try again later.`;
  }
};

const generateFallbackSummary = (profile) => {
  const monthlyExpenses = (
    (profile.housing_expense || 0) + (profile.food_expense || 0) + (profile.transport_expense || 0) +
    (profile.utilities_expense || 0) + (profile.entertainment_expense || 0) +
    (profile.other_expense || 0) + (profile.monthly_loan_emi || 0)
  );
  const surplus = (profile.monthly_income || 0) - monthlyExpenses;
  const savingsRate = profile.monthly_income > 0 ? (surplus / profile.monthly_income) * 100 : 0;
  return `Savings rate: ${savingsRate.toFixed(1)}%. Surplus: ₹${surplus.toLocaleString()}. Build emergency fund and diversify investments.`;
};

module.exports = {
  getAISummary,
  getChatResponse,
};
