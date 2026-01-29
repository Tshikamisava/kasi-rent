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
import './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Configure CORS to allow the frontend origin from env or localhost fallbacks
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: This origin is not allowed'));
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

  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();