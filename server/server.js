import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/mysql.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes, { messageRouter } from "./routes/chatRoutes.js";
import fraudDetectionRoutes from "./routes/fraudDetectionRoutes.js";
import descriptionGeneratorRoutes from "./routes/descriptionGeneratorRoutes.js";
import './models/index.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Webhook route needs raw body - must be before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRouter);
app.use('/api/fraud-detection', fraudDetectionRoutes);
app.use('/api/description-generator', descriptionGeneratorRoutes);

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
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();