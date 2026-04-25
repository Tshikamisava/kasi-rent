import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import * as connectRedisModule from 'connect-redis';
import { createClient as createRedisClient } from 'redis';
import passport from "./config/passport.js";
import { connectDB } from "./config/mysql.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import marketplaceRoutes from "./routes/marketplace.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes, { messageRouter } from "./routes/chatRoutes.js";
import fraudDetectionRoutes from "./routes/fraudDetectionRoutes.js";
import descriptionGeneratorRoutes from "./routes/descriptionGeneratorRoutes.js";
import recommendationsRoutes from "./routes/recommendationsRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
console.log('🔧 Starting KasiRent server (server.js) - PID', process.pid);
const app = express();

// Warn if JWT_SECRET is not set to help diagnose "invalid signature" issues
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not set. Server will use a built-in development JWT secret.');
  console.warn('Set JWT_SECRET in your server/.env to a consistent value to avoid "invalid signature" errors across environments.');
}

// Configure CORS to allow frontend origins from env, with localhost fallbacks.
// Supported env vars:
// - CLIENT_URL: single URL (existing behavior)
// - CORS_ALLOWED_ORIGINS: comma-separated origins
// - CORS_ALLOW_VERCEL_PREVIEWS: true/false (allow *.vercel.app)
const corsAllowedOrigins = [
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ...(process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

const allowVercelPreviews = String(process.env.CORS_ALLOW_VERCEL_PREVIEWS || '').toLowerCase() === 'true';

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow non-browser clients (curl, mobile apps, server-to-server)
  if (corsAllowedOrigins.includes(origin)) return true;
  if (allowVercelPreviews && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy: This origin is not allowed (${origin})`));
  },
  credentials: true
}));

// Session middleware for Passport
{
  // Use Redis-backed session store in production when REDIS_URL is provided
  const connectRedis = connectRedisModule.default || connectRedisModule;
  const RedisStore = typeof connectRedis === 'function' ? connectRedis(session) : null;
  let redisClient = null;
  if (process.env.REDIS_URL && RedisStore) {
    redisClient = createRedisClient({ url: process.env.REDIS_URL });
    redisClient.connect().then(() => console.log('✅ Redis client connected for sessions')).catch((err) => console.error('❌ Redis session client error', err));
  }

  app.use(session({
    store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  }));
}

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Webhook route needs raw body - must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/properties", propertyRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRouter);
app.use('/api/fraud-detection', fraudDetectionRoutes);
app.use('/api/description-generator', descriptionGeneratorRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.get("/", (req, res) => res.send("Kasirent API running 🚀"));

const PORT = process.env.PORT || 5001;

// Start server and connect to MySQL
import http from 'http';
import { initSocket } from './socket.js';

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("⚠️  Database connection failed, starting API in degraded mode:", err.message);
  }

  const server = http.createServer(app);
  try {
    await initSocket(server);
  } catch (err) {
    console.error('⚠️ Socket initialization failed:', err);
  }

  // Add a graceful error handler for common listen errors
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Kill the process using it or set a different PORT environment variable.`);
      console.error(`On Windows: netstat -ano | findstr :${PORT}  OR use: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object -ExpandProperty OwningProcess`);
      process.exit(1);
    }
    if (err && err.code === 'EACCES') {
      console.error(`Insufficient privileges to bind to port ${PORT}. Try running with elevated permissions or choose a different port.`);
      process.exit(1);
    }
    console.error('Server encountered an error:', err);
    process.exit(1);
  });

  server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();