import express from "express";
import { getLandlordContact, getUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get landlord contact information (for tenants)
router.get("/landlord/:landlord_id/contact", protect, getLandlordContact);

// Get user profile
router.get("/profile/:user_id", protect, getUserProfile);
router.get("/profile", protect, getUserProfile);

export default router;
