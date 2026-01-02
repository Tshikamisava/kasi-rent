import express from 'express';
import {
  submitReview,
  getPropertyReviews,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Submit a review
router.post('/', submitReview);

// Get reviews for a property
router.get('/property/:propertyId', getPropertyReviews);

// Delete a review
router.delete('/:reviewId', deleteReview);

export default router;
