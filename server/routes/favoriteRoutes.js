import express from 'express';
import { 
  addFavorite, 
  removeFavorite, 
  getUserFavorites, 
  checkFavorite 
} from '../controllers/favoriteController.js';

const router = express.Router();

router.post('/add', addFavorite);
router.post('/remove', removeFavorite);
router.get('/user/:user_id', getUserFavorites);
router.get('/check', checkFavorite);

export default router;
