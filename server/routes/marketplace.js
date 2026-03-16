import express from 'express';
import * as marketplaceController from '../controllers/marketplaceController.js';

const router = express.Router();

// Get all marketplace items
router.get('/', marketplaceController.getAllItems);
// Get single item
router.get('/:id', marketplaceController.getItemById);
// Create item
router.post('/', marketplaceController.createItem);
// Update item
router.put('/:id', marketplaceController.updateItem);
// Delete item
router.delete('/:id', marketplaceController.deleteItem);

export default router;
