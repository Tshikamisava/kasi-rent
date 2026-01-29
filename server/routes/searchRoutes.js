import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';
import Property from '../models/Property.js';
import SavedSearch from '../models/SavedSearch.js';
import User from '../models/User.js';

const router = express.Router();

// Nearby search: return properties within `radius` km of lat/lng
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5, limit = 50 } = req.query;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return res.status(400).json({ success: false, error: 'lat and lng query params required' });
    }

    // Fetch candidate properties with coordinates
    const candidates = await Property.findAll({
      where: {
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null },
        status: 'available'
      },
      include: [{ model: User, as: 'landlord', attributes: ['id', 'name', 'email'] }]
    });

    // Haversine distance
    function haversine(lat1, lon1, lat2, lon2) {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const results = candidates
      .map((p) => {
        const plat = Number(p.latitude);
        const plng = Number(p.longitude);
        const distance = haversine(latNum, lngNum, plat, plng);
        return { property: p, distance };
      })
      .filter((x) => x.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Number(limit))
      .map((x) => ({ ...x.property.toJSON(), distance_km: Number(x.distance.toFixed(3)) }));

    res.json({ success: true, total: results.length, properties: results });
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({ success: false, error: 'Failed to perform nearby search' });
  }
});

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
