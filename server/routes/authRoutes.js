import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Google OAuth routes
router.get('/google', passport.authenticate('google', { session: false }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/signin?error=google_auth_failed' }),
  (req, res) => {
    const token = generateToken(req.user);
    const user = {
      _id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar_url: req.user.avatar_url
    };
    
    // Redirect to frontend with token and user data
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/signin?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { session: false, scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/signin?error=github_auth_failed' }),
  (req, res) => {
    const token = generateToken(req.user);
    const user = {
      _id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar_url: req.user.avatar_url
    };
    
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/signin?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);
  }
);

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { session: false, scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/signin?error=facebook_auth_failed' }),
  (req, res) => {
    const token = generateToken(req.user);
    const user = {
      _id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      avatar_url: req.user.avatar_url
    };
    
    const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/signin?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);
  }
);

export default router;
