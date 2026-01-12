import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
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
import './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.get("/", (req, res) => res.send("Kasirent API running 🚀"));

const PORT = process.env.PORT || 5000;

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
  initSocket(server);
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();