import User from '../models/User.js';

/**
 * Get Landlord Contact Information
 * Returns contact info for a landlord (for tenants to contact)
 */
export const getLandlordContact = async (req, res) => {
  try {
    const { landlord_id } = req.params;

    if (!landlord_id) {
      return res.status(400).json({ error: 'Landlord ID is required' });
    }

    // Find the landlord user
    const landlord = await User.findByPk(landlord_id, {
      attributes: ['id', 'name', 'email', 'phone'], // Only return contact info
    });

    if (!landlord) {
      return res.status(404).json({ error: 'Landlord not found' });
    }

    // Check if user is a landlord
    if (landlord.role !== 'landlord') {
      return res.status(403).json({ error: 'User is not a landlord' });
    }

    // Return contact information
    res.json({
      success: true,
      landlord: {
        id: landlord.id,
        name: landlord.name || 'Landlord',
        email: landlord.email,
        phone: landlord.phone || null,
      },
    });
  } catch (error) {
    console.error('Error fetching landlord contact:', error);
    res.status(500).json({
      error: 'Failed to fetch landlord contact information',
      message: error.message,
    });
  }
};

/**
 * Get User Profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.user_id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }, // Don't return password
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: error.message,
    });
  }
};

