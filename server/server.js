import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
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
  'https://kasi-rent-seven.vercel.app',
  'https://kasi-rent.vercel.app',
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
const uploadsRoot = path.join(__dirname, 'uploads');
const propertiesUploadsDir = path.join(uploadsRoot, 'properties');
const placeholderUploadImage = path.join(uploadsRoot, 'property-placeholder.svg');

if (!fs.existsSync(placeholderUploadImage)) {
  fs.writeFileSync(
    placeholderUploadImage,
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-label="Property image placeholder"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient></defs><rect width="1200" height="800" fill="url(#bg)"/><g fill="#94a3b8"><path d="M220 560l180-210 120 120 160-190 300 280v120H220z" opacity=".4"/><circle cx="410" cy="330" r="48" opacity=".55"/></g><text x="50%" y="72%" text-anchor="middle" fill="#64748b" font-family="Arial, Helvetica, sans-serif" font-size="38">Property image unavailable</text></svg>`
  );
}

app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Return image placeholder for missing property images instead of HTML 404
app.get('/uploads/properties/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename || '');
  const requestedImage = path.join(propertiesUploadsDir, safeFilename);

  if (safeFilename && fs.existsSync(requestedImage)) {
    return res.sendFile(requestedImage);
  }

  return res.sendFile(placeholderUploadImage);
});

app.use('/uploads', express.static(uploadsRoot));

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
  const server = http.createServer(app);

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

  server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    try {
      await initSocket(server);
    } catch (err) {
      console.error('⚠️ Socket initialization failed:', err);
    }

    try {
      await connectDB();
    } catch (err) {
      console.error("⚠️  Database connection failed, API is running in degraded mode:", err.message);
    }
  });
};

startServer();