import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Decode token without verification to check if it's a Supabase token
      const decodedUnverified = jwt.decode(token);
      let decoded;
      
      // Check if it's a Supabase token (has 'sub' field instead of 'id')
      if (decodedUnverified && decodedUnverified.sub && decodedUnverified.aud === 'authenticated') {
        // It's a Supabase token - don't verify with JWT_SECRET, just decode
        decoded = decodedUnverified;
        console.log('Supabase token detected for user:', decoded.sub);
        
        // Try to find user in MySQL by Supabase ID
        let user = await User.findByPk(decoded.sub);
        
        // If user doesn't exist in MySQL, create a minimal user object from Supabase token
        if (!user) {
          console.log('User not in MySQL, creating from Supabase token:', decoded.sub);
          req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.user_metadata?.name || decoded.email,
            role: decoded.user_metadata?.userType || 'tenant'
          };
        } else {
          req.user = user;
        }
      } else {
        // It's a regular JWT token - verify with JWT_SECRET
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Try to find user in MySQL
        let user = await User.findByPk(decoded.id);
        
        // If user doesn't exist in MySQL, create a minimal user object from token
        if (!user && decoded.id) {
          console.log('User not in MySQL, creating from JWT token:', decoded.id);
          req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role || 'tenant'
          };
        } else {
          req.user = user;
        }
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};