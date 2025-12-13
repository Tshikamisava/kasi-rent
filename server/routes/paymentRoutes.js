import express from "express";
import {
  initializePayment,
  verifyPayment,
  getUserPayments,
  getPaymentById,
  paymentWebhook
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Initialize payment (requires auth)
router.post("/initialize", protect, initializePayment);

// Verify payment (public - called by Paystack)
router.get("/verify", verifyPayment);

// Webhook endpoint (public - called by Paystack)
// Note: Raw body is handled in server.js middleware
router.post("/webhook", paymentWebhook);

// Get user payments (requires auth)
router.get("/user/:user_id", protect, getUserPayments);

// Get payment by ID (requires auth)
router.get("/:id", protect, getPaymentById);

export default router;

