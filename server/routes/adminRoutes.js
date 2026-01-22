import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import User from '../models/User.js';
import { getPendingDocuments, verifyDocument } from '../controllers/propertyController.js';

const router = express.Router();

// Admin: update a user's role
router.put('/user/:id/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowed = ['tenant', 'landlord', 'agent', 'admin'];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ success: true, message: 'User role updated', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

// Admin: update a user's role by email
router.put('/user/role', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { email, role } = req.body;

    const allowed = ['tenant', 'landlord', 'agent', 'admin'];
    if (!email || !role || !allowed.includes(role)) {
      return res.status(400).json({ success: false, error: 'Email and valid role are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.role = role;
    await user.save();

    res.json({ success: true, message: 'User role updated', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Admin update role by email error:', error);
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

// Admin: document verification endpoints
router.get('/documents/pending', authenticateToken, authorizeRole('admin'), getPendingDocuments);
router.post('/documents/:id/verify', authenticateToken, authorizeRole('admin'), verifyDocument);

export default router;
