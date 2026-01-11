import { sequelize } from '../config/mysql.js';
import { protect } from '../middleware/authMiddleware.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';

// Get user profile with stats
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user info
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, profile_photo, bio, phone, location, created_at
      FROM users 
      WHERE id = ?
    `, { replacements: [userId] });
    
    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get user stats
    const [propertyStats] = await sequelize.query(`
      SELECT COUNT(*) as total_properties
      FROM properties 
      WHERE landlord_id = ?
    `, { replacements: [userId] });
    
    const [bookingStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings
      FROM bookings 
      WHERE user_id = ?
    `, { replacements: [userId] });
    
    const [favoriteStats] = await sequelize.query(`
      SELECT COUNT(*) as total_favorites
      FROM favorites 
      WHERE user_id = ?
    `, { replacements: [userId] });
    
    res.json({
      user,
      stats: {
        properties: propertyStats[0].total_properties || 0,
        bookings: bookingStats[0].total_bookings || 0,
        confirmedBookings: bookingStats[0].confirmed_bookings || 0,
        pendingBookings: bookingStats[0].pending_bookings || 0,
        favorites: favoriteStats[0].total_favorites || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, phone, location, profile_photo } = req.body;
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (profile_photo !== undefined) {
      updates.push('profile_photo = ?');
      values.push(profile_photo);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(userId);
    
    await sequelize.query(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, { replacements: values });
    
    // Get updated user
    const [users] = await sequelize.query(`
      SELECT id, name, email, role, profile_photo, bio, phone, location, created_at
      FROM users 
      WHERE id = ?
    `, { replacements: [userId] });
    
    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Get user's properties
export const getUserProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [properties] = await sequelize.query(`
      SELECT 
        p.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT b.id) as booking_count
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id
      LEFT JOIN bookings b ON p.id = b.property_id
      WHERE p.landlord_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, { replacements: [userId] });
    
    res.json(properties);
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [bookings] = await sequelize.query(`
      SELECT 
        b.*,
        p.title as property_title,
        p.location as property_location,
        p.price as property_price,
        p.images as property_images,
        u.name as landlord_name,
        u.email as landlord_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON p.landlord_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, { replacements: [userId] });
    
    // Parse images JSON
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      property_images: booking.property_images ? JSON.parse(booking.property_images) : []
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};
