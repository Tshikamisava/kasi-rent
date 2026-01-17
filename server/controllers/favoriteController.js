import Favorite from '../models/Favorite.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// Add to favorites
export const addFavorite = async (req, res) => {
  try {
    const { user_id, property_id } = req.body;

    if (!user_id || !property_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Property ID are required' 
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { user_id, property_id }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property already in favorites' 
      });
    }

    const favorite = await Favorite.create({ user_id, property_id });

    res.status(201).json({ 
      success: true, 
      favorite,
      message: 'Added to favorites' 
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Remove from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { user_id, property_id } = req.body;

    if (!user_id || !property_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Property ID are required' 
      });
    }

    const deleted = await Favorite.destroy({
      where: { user_id, property_id }
    });

    if (deleted === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Favorite not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Removed from favorites' 
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get user's favorites
export const getUserFavorites = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const favorites = await Favorite.findAll({
      where: { user_id },
      include: [
        {
          model: Property,
          as: 'property'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // If associations aren't present (older DB), fetch properties and user separately
    if (favorites.length > 0 && (!favorites[0].property || !favorites[0].user)) {
      const propertyIds = favorites.map(f => f.property_id);
      const properties = await Property.findAll({
        where: { id: { [Op.in]: propertyIds } }
      });

      const userRecord = await User.findByPk(user_id);

      const favoritesWithRelations = favorites.map(fav => {
        const property = properties.find(p => p.id === fav.property_id) || null;
        return {
          ...fav.toJSON(),
          property,
          user: userRecord ? userRecord.toJSON() : null
        };
      });

      return res.json({ 
        success: true, 
        favorites: favoritesWithRelations 
      });
    }

    res.json({ 
      success: true, 
      favorites 
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Check if property is favorited
export const checkFavorite = async (req, res) => {
  try {
    const { user_id, property_id } = req.query;

    if (!user_id || !property_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Property ID are required' 
      });
    }

    const favorite = await Favorite.findOne({
      where: { user_id, property_id }
    });

    res.json({ 
      success: true, 
      isFavorited: !!favorite 
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
