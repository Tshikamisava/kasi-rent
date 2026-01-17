import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';
import Property from '../models/Property.js';
import SavedSearch from '../models/SavedSearch.js';

const router = express.Router();

// Advanced property search with filters
router.get('/', async (req, res) => {
  try {
    const {
      location,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      property_type,
      furnished,
      pets_allowed,
      utilities_included,
      available_from,
      sort_by = 'created_at',
      order = 'DESC',
      limit = 20,
      offset = 0
    } = req.query;

    const where = { status: 'available' };

    // Location filter (city or address)
    if (location) {
      where[Op.or] = [
        { location: { [Op.like]: `%${location}%` } },
        { address: { [Op.like]: `%${location}%` } }
      ];
    }

    // Price range
    if (min_price) {
      where.price = { ...where.price, [Op.gte]: parseFloat(min_price) };
    }
    if (max_price) {
      where.price = { ...where.price, [Op.lte]: parseFloat(max_price) };
    }

    // Bedrooms
    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms);
    }

    // Bathrooms
    if (bathrooms) {
      where.bathrooms = { [Op.gte]: parseInt(bathrooms) };
    }

    // Property type
    if (property_type && property_type !== 'all') {
      where.property_type = property_type;
    }

    // Boolean filters
    if (furnished === 'true') {
      where.furnished = true;
    }
    if (pets_allowed === 'true') {
      where.pets_allowed = true;
    }
    if (utilities_included === 'true') {
      where.utilities_included = true;
    }

    // Available from date
    if (available_from) {
      where.available_from = { [Op.lte]: new Date(available_from) };
    }

    // Execute search
    const { count, rows: properties } = await Property.findAndCountAll({
      where,
      order: [[sort_by, order]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: count,
      properties,
      page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
      pages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search properties'
    });
  }
});

// Save search (Authenticated users)
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      location,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      property_type,
      furnished,
      pets_allowed,
      utilities_included,
      move_in_date,
      email_alerts,
      alert_frequency
    } = req.body;

    const savedSearch = await SavedSearch.create({
      user_id: userId,
      name,
      location,
      min_price,
      max_price,
      bedrooms,
      bathrooms,
      property_type,
      furnished,
      pets_allowed,
      utilities_included,
      move_in_date,
      email_alerts,
      alert_frequency
    });

    res.json({
      success: true,
      message: 'Search saved successfully',
      saved_search: savedSearch
    });
  } catch (error) {
    console.error('Error saving search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save search'
    });
  }
});

// Get user's saved searches
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const savedSearches = await SavedSearch.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      saved_searches: savedSearches
    });
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved searches'
    });
  }
});

// Delete saved search
router.delete('/saved/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const savedSearch = await SavedSearch.findOne({
      where: { id, user_id: userId }
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    await savedSearch.destroy();

    res.json({
      success: true,
      message: 'Saved search deleted'
    });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete saved search'
    });
  }
});

// Execute saved search by ID
router.get('/saved/:id/results', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const savedSearch = await SavedSearch.findOne({
      where: { id, user_id: userId }
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        error: 'Saved search not found'
      });
    }

    // Build where clause from saved search
    const where = { status: 'available' };

    if (savedSearch.location) {
      where[Op.or] = [
        { location: { [Op.like]: `%${savedSearch.location}%` } },
        { address: { [Op.like]: `%${savedSearch.location}%` } }
      ];
    }

    if (savedSearch.min_price) {
      where.price = { ...where.price, [Op.gte]: savedSearch.min_price };
    }
    if (savedSearch.max_price) {
      where.price = { ...where.price, [Op.lte]: savedSearch.max_price };
    }
    if (savedSearch.bedrooms) {
      where.bedrooms = savedSearch.bedrooms;
    }
    if (savedSearch.bathrooms) {
      where.bathrooms = { [Op.gte]: savedSearch.bathrooms };
    }
    if (savedSearch.property_type) {
      where.property_type = savedSearch.property_type;
    }
    if (savedSearch.furnished !== null) {
      where.furnished = savedSearch.furnished;
    }
    if (savedSearch.pets_allowed !== null) {
      where.pets_allowed = savedSearch.pets_allowed;
    }
    if (savedSearch.utilities_included !== null) {
      where.utilities_included = savedSearch.utilities_included;
    }

    const properties = await Property.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      search_name: savedSearch.name,
      properties,
      count: properties.length
    });
  } catch (error) {
    console.error('Error executing saved search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute saved search'
    });
  }
});

export default router;
