import express from 'express';
import {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
  updateSubscription
  ,checkoutSubscription,
  cancelSubscription,
  reactivateSubscription,
  chargeSubscriptionNow,
  processDueSubscriptions,
  purgePendingMockSubscriptions,
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

// Cancel subscription
router.post('/:id/cancel', protect, cancelSubscription);

// Renew/reactivate subscription
router.post('/:id/reactivate', protect, reactivateSubscription);

// Charge one subscription immediately (owner/admin)
router.post('/:id/charge', protect, chargeSubscriptionNow);

// Admin bulk processing of due recurring subscriptions
router.post('/process/due', protect, processDueSubscriptions);

// Admin cleanup for historical mock pending subscriptions
router.delete('/admin/cleanup-mock', protect, purgePendingMockSubscriptions);

export default router;
