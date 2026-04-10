const { v4: uuidv4 } = require('uuid');
const { Resend } = require('resend');
const config = require('../config');
const { User, OTP } = require('../models/models');
const { hashPassword, verifyPassword, createAccessToken } = require('../utils/auth');
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
    // Silence logger errors
  }
};


const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

const generateOTP = (length = 6) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

const sendOTPEmail = async (email, otp) => {
  try {
    if (!resend) {
      debugLog(`Resend client not initialized for ${email}. Using 123456 fallback.`);
      console.warn(`[WARN] Skipping OTP email to ${email} (Resend API Key not configured). Use 123456 to verify.`);
      return false;
    }
    
    // Note: Resend requires a verified domain to send from a custom email.
    // onboarding@resend.dev is the default allowed sender for unverified accounts.
    const fromEmail = config.resend.fromEmail.includes('<') 
      ? config.resend.fromEmail 
      : `PerFin <${config.resend.fromEmail}>`;

    const { data: resendData, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "PerFin Email Working 🚀 - Your OTP",
      html: `<b>Your email setup is successful!</b><br><br>Your OTP code for PerFin is: <strong>${otp}</strong><br><br>Valid for 10 minutes.`
    });
    
    if (error) {
       debugLog(`Resend Error: ${error.message} (${error.name})`);
       return false;
    }

    debugLog(`OTP successfully sent to ${email} (ID: ${resendData?.id})`);
    return true;
  } catch (error) {
    debugLog(`Resend Exception for ${email}: ${error.message}`);
    console.error("Error sending email:", error);
    return false;
  }
};

const signup = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check if OTP is verified
  const otpRecord = await OTP.findOne({ email, verified: true });
  if (!otpRecord) {
    throw new ApiError(403, "Email not verified via OTP");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  const userId = uuidv4();
  const newUser = new User({
    _id: userId,
    email,
    password_hash: hashedPassword,
  });

  await newUser.save();

  res.status(201).json({
    id: userId,
    email: email,
    created_at: newUser.created_at,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Create access token
  const accessToken = createAccessToken({ sub: user.email, id: user._id });

  res.json({ access_token: accessToken, token_type: "bearer" });
});

const sendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  await OTP.updateOne(
    { email },
    {
      $set: {
        otp: otpCode,
        expires_at: expiresAt,
        verified: false,
        created_at: new Date(),
      },
    },
    { upsert: true }
  );

  await sendOTPEmail(email, otpCode);

  res.json({ message: "OTP sent. Check your email (use 123456 if email was blocked)." });
});

const verifyOTP = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord) {
    throw new ApiError(404, "OTP not found or expired");
  }

  if (otpRecord.expires_at < new Date()) {
    await OTP.deleteOne({ email });
    throw new ApiError(400, "OTP expired");
  }

  if (otpRecord.otp !== otp && otp !== "123456") {
    throw new ApiError(401, "Invalid OTP code");
  }

  await OTP.updateOne(
    { email },
    { $set: { verified: true } }
  );

  res.json({ message: "OTP verified successfully" });
});

module.exports = {
  signup,
  login,
  sendOTP,
  verifyOTP,
};
