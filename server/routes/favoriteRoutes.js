import express from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Add a property to favorites
router.post('/', favoriteController.addFavorite);

// Get user's favorites
router.get('/', favoriteController.getFavorites);

// Check if property is favorited
router.get('/check/:propertyId', favoriteController.checkFavorite);

// Get favorite count for a property
router.get('/count/:propertyId', favoriteController.getFavoriteCount);

// Remove a property from favorites
router.delete('/:propertyId', favoriteController.removeFavorite);

export default router;
