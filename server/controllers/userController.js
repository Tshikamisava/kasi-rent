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
 * Find User by Email
 */
export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'role'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found with that email' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error finding user by email:', error);
    res.status(500).json({
      error: 'Failed to find user',
      message: error.message,
    });
  }
};

/**
 * List Users (for starting conversations)
 */
export const listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    console.log('Listing users with search:', search, 'role:', role);
    
    const where = {};

    // Filter by role if specified
    if (role && ['landlord', 'tenant', 'agent'].includes(role)) {
      where.role = role;
    }

    // Search by name or email
    if (search) {
      const { Op } = await import('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'role'],
      limit: 50,
      order: [['name', 'ASC']],
    });

    console.log(`Found ${users.length} users`);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      error: 'Failed to list users',
      message: error.message,
    });
  }
};
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

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { avatar_url } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!avatar_url) return res.status(400).json({ error: 'avatar_url is required' });

    await User.update({ avatar_url }, { where: { id: userId } });
    const user = await User.findByPk(userId, { attributes: ['id', 'avatar_url'] });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar', message: error.message });
  }
};

/**
 * Sync Supabase user to MySQL (for chat functionality)
 */
export const syncUser = async (req, res) => {
  try {
    const user = req.user; // From auth middleware
    
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user already exists in MySQL
    let mysqlUser = await User.findByPk(user.id);
    
    if (mysqlUser) {
      return res.json({ success: true, message: 'User already synced', user: mysqlUser });
    }

    // Create user in MySQL
    mysqlUser = await User.create({
      id: user.id,
      name: user.name || 'User',
      email: user.email,
      role: user.role || 'tenant',
    });

    res.json({ success: true, message: 'User synced to database', user: mysqlUser });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user', message: error.message });
  }
};
