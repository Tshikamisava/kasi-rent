import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getProfile, 
  updateProfile, 
  getUserProperties, 
  getUserBookings 
} from '../controllers/profileController.js';

const router = express.Router();

// Get current user profile
router.get('/', protect, getProfile);

// Update user profile
router.put('/', protect, updateProfile);

// Get user's properties
router.get('/properties', protect, getUserProperties);

// Get user's bookings
router.get('/bookings', protect, getUserBookings);

export default router;
