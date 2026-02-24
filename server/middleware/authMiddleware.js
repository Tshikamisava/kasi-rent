import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = req.headers.authorization.split(' ')[1];

    // Always verify tokens with the server JWT secret (use default fallback
    // to remain compatible when JWT_SECRET isn't set in env during dev).
    const jwtSecret = process.env.JWT_SECRET || 'kasirent_jwt_secret_key_2025';
    const decoded = jwt.verify(token, jwtSecret);

    // Prefer `decoded.id` but fall back to `decoded.sub` if present.
    const userId = decoded.id || decoded.sub;

    let user = null;
    if (userId) {
      user = await User.findByPk(userId);
    }

    if (user) {
      // Attach the Sequelize user instance (has `role` field)
      req.user = user;
    } else {
      // If user isn't in DB, attach a minimal object from token claims
      req.user = {
        id: userId || null,
        email: decoded.email || null,
        name: decoded.name || decoded.email || null,
        role: decoded.role || 'tenant'
      };
    }

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Export alias for backward compatibility
export const authenticateToken = protect;