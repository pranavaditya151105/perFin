require('dotenv').config(); // MUST be first — loads .env before any other module
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const connectDB = require('./config/db');
const { errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');


// Routes
const authRoutes = require('./routes/auth');
const analyzeRoutes = require('./routes/analyze');
const chatRoutes = require('./routes/chat');
const otpRoutes = require('./routes/otp');
const uploadRoutes = require('./routes/upload');

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration: allow all in development, restricted in production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://www.perfin.me',
  'https://perfin.me',
  'http://localhost:3000',
  /\.vercel\.app$/ // Allow any Vercel preview/production branch
];

app.use(cors({
  origin: config.env === 'production' ? allowedOrigins : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.head("/", (req, res) => res.status(200).end());
app.get('/health', (req, res) => res.json({ status: "ok", env: config.env }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api', analyzeRoutes);
app.use('/api', chatRoutes);
app.use('/api', uploadRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: "PerFin AI Backend Running ✅",
    version: "1.0.0"
  });
});

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Endpoint not found'));
});

// Global Error Handler
app.use(errorHandler);

// Graceful startup
connectDB().then(() => {
  const port = config.port;
  app.listen(port, () => {
    if (config.env === 'development') {
      console.log(`🚀 Server running on http://localhost:${port}`);
    }
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

module.exports = app;

