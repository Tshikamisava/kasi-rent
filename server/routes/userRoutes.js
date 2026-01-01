import express from "express";
import { getLandlordContact, getUserProfile, findUserByEmail, listUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get landlord contact information (for tenants)
router.get("/landlord/:landlord_id/contact", protect, getLandlordContact);

// Get user profile
router.get("/profile/:user_id", protect, getUserProfile);
router.get("/profile", protect, getUserProfile);

// Find user by email (public for chat discovery)
router.get("/find", findUserByEmail);

// List users (public for chat discovery)
router.get("/list", listUsers);

// Update avatar (expects avatar_url from Supabase)
router.patch('/profile/avatar', protect, (req, res, next) => import('../controllers/userController.js').then(m => m.updateAvatar(req,res,next)));

export default router;
