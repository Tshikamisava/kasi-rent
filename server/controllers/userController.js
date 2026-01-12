import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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
 * Request Password Reset
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        success: true, 
        message: 'If an account exists with that email, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiry (1 hour from now)
    user.reset_password_token = hashedToken;
    user.reset_password_expires = new Date(Date.now() + 3600000);
    await user.save();

    // In production, send email here
    // For now, return token in response (remove in production)
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    console.log('Password reset URL:', resetUrl);
    console.log('Reset token:', resetToken);

    // TODO: Implement email sending with nodemailer
    // await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ 
      success: true, 
      message: 'Password reset instructions sent to your email.',
      // Remove this in production:
      resetUrl: resetUrl 
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      error: 'Failed to process password reset request',
      message: error.message,
    });
  }
};

/**
 * Reset Password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the token to compare
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      where: {
        reset_password_token: hashedToken,
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (user.reset_password_expires < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password and update user
    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      error: 'Failed to reset password',
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
