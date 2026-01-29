import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import { sequelize } from '../config/mysql.js';

const router = express.Router();

// Get user profile with stats
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'phone', 'avatar_url', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get stats based on role
    let stats = {
      properties: 0,
      bookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      favorites: 0
    };

    if (user.role === 'landlord') {
      // Count landlord's properties
      const propertyCount = await Property.count({
        where: { landlord_id: userId }
      });
      stats.properties = propertyCount;

      // Count bookings for landlord's properties
      const [bookingStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM bookings b
        INNER JOIN properties p ON b.property_id = p.id
        WHERE p.landlord_id = :userId
      `, {
        replacements: { userId }
      });

      if (bookingStats.length > 0) {
        stats.bookings = parseInt(bookingStats[0].total) || 0;
        stats.confirmedBookings = parseInt(bookingStats[0].confirmed) || 0;
        stats.pendingBookings = parseInt(bookingStats[0].pending) || 0;
      }
    } else {
      // Count tenant's bookings
      const [bookingStats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM bookings
        WHERE tenant_id = :userId
      `, {
        replacements: { userId }
      });

      if (bookingStats.length > 0) {
        stats.bookings = parseInt(bookingStats[0].total) || 0;
        stats.confirmedBookings = parseInt(bookingStats[0].confirmed) || 0;
        stats.pendingBookings = parseInt(bookingStats[0].pending) || 0;
      }
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile_photo: user.avatar_url,
        created_at: user.created_at
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, bio, location, profile_photo } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profile_photo !== undefined) user.avatar_url = profile_photo;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile_photo: user.avatar_url,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's properties (for landlords)
router.get('/properties', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const properties = await Property.findAll({
      where: { landlord_id: userId },
      order: [['created_at', 'DESC']]
    });

    // Format response
    const formattedProperties = properties.map(prop => ({
      id: prop.id,
      title: prop.title,
      location: prop.location,
      price: prop.price,
      images: prop.images || [],
      average_rating: 0,
      review_count: 0,
      booking_count: 0
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get user's bookings
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    let bookings;

    if (user.role === 'landlord') {
      // Get bookings for landlord's properties
      const [results] = await sequelize.query(`
        SELECT 
          b.id,
          b.check_in_date,
          b.check_out_date,
          b.status,
          b.total_price,
          p.title as property_title,
          p.location as property_location,
          p.price as property_price,
          p.images as property_images,
          u.name as tenant_name
        FROM bookings b
        INNER JOIN properties p ON b.property_id = p.id
        INNER JOIN users u ON b.tenant_id = u.id
        WHERE p.landlord_id = :userId
        ORDER BY b.created_at DESC
      `, {
        replacements: { userId }
      });
      bookings = results;
    } else {
      // Get tenant's bookings
      const [results] = await sequelize.query(`
        SELECT 
          b.id,
          b.check_in_date,
          b.check_out_date,
          b.status,
          b.total_price,
          p.title as property_title,
          p.location as property_location,
          p.price as property_price,
          p.images as property_images,
          u.name as landlord_name
        FROM bookings b
        INNER JOIN properties p ON b.property_id = p.id
        INNER JOIN users u ON p.landlord_id = u.id
        WHERE b.tenant_id = :userId
        ORDER BY b.created_at DESC
      `, {
        replacements: { userId }
      });
      bookings = results;
    }

    // Parse images JSON
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      property_images: typeof booking.property_images === 'string' 
        ? JSON.parse(booking.property_images) 
        : booking.property_images || []
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
