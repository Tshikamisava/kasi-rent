import { sequelize } from '../config/mysql.js';
import Favorite from '../models/Favorite.js';
import Property from '../models/Property.js';

// Add a property to favorites
export const addFavorite = async (req, res) => {
  const userId = req.user.id;
  const { propertyId } = req.body;

  try {
    // Check if property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: {
        user_id: userId,
        property_id: propertyId
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }

    // Add to favorites
    const favorite = await Favorite.create({
      user_id: userId,
      property_id: propertyId
    });

    res.status(201).json({ 
      message: 'Property added to favorites',
      favorite 
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
};

// Remove a property from favorites
export const removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const { propertyId } = req.params;

  try {
    const deleted = await Favorite.destroy({
      where: {
        user_id: userId,
        property_id: propertyId
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Error removing favorite', error: error.message });
  }
};

// Get user's favorites
export const getFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const favorites = await sequelize.query(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*,
        u.name as landlord_name,
        u.email as landlord_email,
        u.phone as landlord_phone,
        (SELECT COUNT(*) FROM favorites WHERE property_id = p.id) as favorite_count,
        (SELECT AVG(rating) FROM reviews WHERE property_id = p.id) as average_rating,
        (SELECT COUNT(*) FROM reviews WHERE property_id = p.id) as review_count
      FROM favorites f
      INNER JOIN properties p ON f.property_id = p.id
      LEFT JOIN users u ON p.landlord_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });

    // Parse images field for each property
    const favoritesWithImages = favorites.map(fav => {
      let parsedImages = [];
      
      // Handle images field parsing
      if (fav.images) {
        try {
          parsedImages = typeof fav.images === 'string' ? JSON.parse(fav.images) : fav.images;
        } catch (e) {
          console.error('Error parsing images for property:', fav.id, e);
          parsedImages = [];
        }
      }
      
      return {
        ...fav,
        images: Array.isArray(parsedImages) ? parsedImages : []
      };
    });

    res.json({
      favorites: favoritesWithImages,
      total: favoritesWithImages.length
    });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ message: 'Error getting favorites', error: error.message });
  }
};

// Check if a property is favorited
export const checkFavorite = async (req, res) => {
  const userId = req.user.id;
  const { propertyId } = req.params;

  try {
    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        property_id: propertyId
      }
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ message: 'Error checking favorite', error: error.message });
  }
};

// Get favorite count for a property
export const getFavoriteCount = async (req, res) => {
  const { propertyId } = req.params;

  try {
    const count = await Favorite.count({
      where: { property_id: propertyId }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting favorite count:', error);
    res.status(500).json({ message: 'Error getting favorite count', error: error.message });
  }
};
