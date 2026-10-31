import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
dotenv.config();

import db from './config/db.js';
import { EnvSchema } from './utils/zodSchemas.js';
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import { getDashboardMetrics } from './controllers/scanController.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import {
  isSupabaseConfigured,
  isSupabaseAdminConfigured,
  testSupabaseConnection
} from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate critical environment configurations
const envValidation = EnvSchema.safeParse(process.env);
if (!envValidation.success) {
  console.warn('⚠️ [Environment Warning] Some environment variables did not pass strict schema:');
  envValidation.error.errors.forEach(err => console.warn(`   - ${err.path.join('.')}: ${err.message}`));
}

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Robust Multi-Origin CORS Security Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow local development ports and configured or deployed Vercel frontends.
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /\.vercel\.app$/.test(origin);

    callback(null, isAllowed);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// High-capacity JSON parser for Base64 multimodal visual payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Health Check with Supabase & Render Telemetry
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'VisionInsight AI',
    deployment: process.env.RENDER ? 'Render Web Service' : 'Local / Custom Node Environment',
    timestamp: new Date().toISOString(),
    aiModel: 'gemini-2.5-flash',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here'),
    supabase: {
      serviceUrlConfigured: Boolean(process.env.SUPABASE_SERVICE_URL || process.env.SUPABASE_URL),
      anonKeyConfigured: Boolean(process.env.SUPABASE_ANON_KEY),
      serviceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      isConfigured: isSupabaseConfigured,
      isAdminConfigured: isSupabaseAdminConfigured
    }
  });
});

// Live Supabase Connectivity Test Endpoint
app.get('/api/health/supabase', async (req, res) => {
  const result = await testSupabaseConnection();
  res.status(result.connected ? 200 : 503).json(result);
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

// Dashboard Aggregate Metrics route
app.get('/api/dashboard/metrics', authenticateToken, getDashboardMetrics);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Express Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

// Start Server and Initialize Database
async function startServer() {
  try {
    await db.initDB();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 VisionInsight AI Backend Server running on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`👁️ Vision Model: Gemini 2.5 Flash via @google/genai`);
      console.log(`🔒 Authentication: JWT with bcrypt password hashing`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to launch backend server:', err);
    process.exit(1);
  }
}

startServer();
