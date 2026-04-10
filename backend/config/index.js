const dotenv = require('dotenv');
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8000,
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET ? process.env.JWT_SECRET : (() => { throw new Error('🚨 JWT_SECRET environment variable is REQUIRED! Add to .env'); })(),
    expiresIn: '7d',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  }
};

module.exports = config;
