const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  name: { type: String, trim: true },
  age: { type: Number, min: 0, max: 120 },
  occupation: { type: String, trim: true },
  location: { type: String, trim: true },
  marital_status: { type: String, enum: ['Single', 'Married', 'Divorced'], default: 'Single' },
  income: {
    sources: [{
      label: { type: String, trim: true },
      amount: { type: Number, min: 0 }
    }],
    total_annual: { type: Number, min: 0, default: 0 },
    monthly_income: { type: Number, min: 0, default: 0 }
  },
  expenses: {
    housing: { type: Number, min: 0, default: 0 },
    food: { type: Number, min: 0, default: 0 },
    transport: { type: Number, min: 0, default: 0 },
    utilities: { type: Number, min: 0, default: 0 },
    entertainment: { type: Number, min: 0, default: 0 },
    other: { type: Number, min: 0, default: 0 },
    loan_emi: { type: Number, min: 0, default: 0 }
  },
  assets: {
    savings: { type: Number, min: 0, default: 0 },
    stocks: { type: Number, min: 0, default: 0 },
    mutual_funds: { type: Number, min: 0, default: 0 },
    gold: { type: Number, min: 0, default: 0 },
    crypto: { type: Number, min: 0, default: 0 },
    real_estate: { type: Number, min: 0, default: 0 },
    provident_fund: { type: Number, min: 0, default: 0 }
  },
  liabilities: {
    total_loans: { type: Number, min: 0, default: 0 },
    credit_card_debt: { type: Number, min: 0, default: 0 }
  },
  latest_analysis: mongoose.Schema.Types.Mixed,
  profile: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

const GoalSchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  goal_type: { type: String, required: true },
  target_amount: { type: Number, min: 0, default: 0 },
  time_horizon_years: { type: Number, min: 0, default: 1 },
  current_savings_for_goal: { type: Number, min: 0, default: 0 },
  monthly_investment: { type: Number, min: 0, default: 0 },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  created_at: { type: Date, default: Date.now }
});

const ChatHistorySchema = new mongoose.Schema({
  user_id: { type: String, required: true, index: true },
  conversation_id: { type: String, required: true, index: true },
  title: { type: String, default: 'New Chat' },
  user_message: { type: String, required: true },
  ai_response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  otp: { type: String, required: true },
  expires_at: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const User = mongoose.model('User', UserSchema);
const Goal = mongoose.model('Goal', GoalSchema);
const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);
const OTP = mongoose.model('OTP', OTPSchema);

module.exports = { User, Goal, ChatHistory, OTP };

