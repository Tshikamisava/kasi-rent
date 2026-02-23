const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');

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

module.exports = router;
