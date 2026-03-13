import express from 'express';
import {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription
  ,checkoutSubscription
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create subscription (pending)
router.post('/', protect, createSubscription);

// Create subscription and initialize checkout (returns authorization_url)
router.post('/checkout', protect, checkoutSubscription);

// Get current user's subscriptions
router.get('/user/:user_id', protect, getUserSubscriptions);

// Get subscription by id
router.get('/:id', protect, getSubscriptionById);

// Update subscription (admin or owner) - protected
router.put('/:id', protect, updateSubscription);

export default router;
