import User from '../models/User.js';
import UserRole from '../models/UserRole.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 */
const generateToken = (user, role) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: role || 'tenant'
    },
    process.env.JWT_SECRET || 'kasirent_jwt_secret_key_2025',
    { expiresIn: '7d' }
  );
};

/**
 * Register New User
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Name, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({ 
          success: false,
          error: 'User with this phone number already exists' 
        });
      }
    }

    // Create user (password will be hashed automatically by the model)
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || null
    });

    // Create user role in user_roles table
    const userRole = role || 'tenant';
    await UserRole.create({
      user_id: user.id,
      role: userRole
    });

    // Generate token
    const token = generateToken(user, userRole);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        userType: userRole,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Registration failed',
      message: error.message 
    });
  }
};

/**
 * Login User
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Find user by email and include their roles
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: UserRole,
        as: 'userRoles',
        attributes: ['role']
      }]
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Get primary role (first role or default to tenant)
    const userRole = user.userRoles && user.userRoles.length > 0 
      ? user.userRoles[0].role 
      : 'tenant';

    // Generate token
    const token = generateToken(user, userRole);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        userType: userRole,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed',
      message: error.message 
    });
  }
};

/**
 * Get Current User (from JWT token)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: UserRole,
        as: 'userRoles',
        attributes: ['role']
      }]
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Get primary role
    const userRole = user.userRoles && user.userRoles.length > 0 
      ? user.userRoles[0].role 
      : 'tenant';

    res.json({
      success: true,
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: userRole,
        userType: userRole,
        avatar_url: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user',
      message: error.message 
    });
  }
};

/**
 * Logout User
 * (For JWT, logout is handled client-side by removing the token)
 */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
