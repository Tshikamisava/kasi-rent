import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import TenantVerification from '../models/TenantVerification.js';
import User from '../models/User.js';
import { upload } from '../config/upload.js';

const router = express.Router();
console.log('🔎 verificationRoutes mounted');

// Submit tenant verification (Tenant only)
router.post('/submit', authenticateToken, upload.fields([
  { name: 'id_document', maxCount: 1 },
  { name: 'employment_letter', maxCount: 1 },
  { name: 'bank_statement', maxCount: 1 },
  { name: 'credit_report', maxCount: 1 },
  { name: 'reference_letter', maxCount: 1 }
]), async (req, res) => {
  try {
    const tenantId = req.user.id;
    const API_BASE = process.env.API_BASE || 'http://localhost:5001';

    // Check if verification already exists
    let verification = await TenantVerification.findOne({
      where: { tenant_id: tenantId }
    });

    const files = req.files || {};
    
    const verificationData = {
      tenant_id: tenantId,
      id_number: req.body.id_number,
      employment_status: req.body.employment_status,
      employer_name: req.body.employer_name,
      monthly_income: req.body.monthly_income,
      previous_landlord_name: req.body.previous_landlord_name,
      previous_landlord_phone: req.body.previous_landlord_phone,
      previous_landlord_email: req.body.previous_landlord_email,
      credit_score: req.body.credit_score,
      
      // Document URLs (secure paths)
      id_document_url: files.id_document ? `${API_BASE}/uploads/verifications/${files.id_document[0].filename}` : null,
      employment_letter_url: files.employment_letter ? `${API_BASE}/uploads/verifications/${files.employment_letter[0].filename}` : null,
      bank_statement_url: files.bank_statement ? `${API_BASE}/uploads/verifications/${files.bank_statement[0].filename}` : null,
      credit_report_url: files.credit_report ? `${API_BASE}/uploads/verifications/${files.credit_report[0].filename}` : null,
      reference_letter_url: files.reference_letter ? `${API_BASE}/uploads/verifications/${files.reference_letter[0].filename}` : null,
      
      status: 'pending'
    };

    if (verification) {
      // Update existing verification
      await verification.update(verificationData);
    } else {
      // Create new verification
      verification = await TenantVerification.create(verificationData);
    }

    res.json({
      success: true,
      message: 'Verification submitted successfully. Admin will review within 24-48 hours.',
      verification: {
        id: verification.id,
        status: verification.status,
        created_at: verification.created_at
      }
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit verification'
    });
  }
});

// Get tenant's own verification status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const tenantId = req.user.id;

    const verification = await TenantVerification.findOne({
      where: { tenant_id: tenantId },
      attributes: [
        'id', 'status', 'id_verified', 'employment_verified',
        'financial_verified', 'references_verified', 'rejection_reason',
        'created_at', 'updated_at', 'reviewed_at'
      ]
    });

    res.json({
      success: true,
      verification: verification || null,
      isVerified: verification?.status === 'verified'
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verification status'
    });
  }
});

// ========== ADMIN ONLY ROUTES ==========

// Get all pending verifications (Admin only)
router.get('/admin/pending', authenticateToken, authorizeRole('admin'), async (req, res) => {
  console.log('⤴️  GET /api/verification/admin/pending called - auth header present?', !!req.headers.authorization, 'user:', req.user && (req.user.id || req.user));
  try {
    const verifications = await TenantVerification.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'email', 'phone', 'created_at']
      }],
      order: [['created_at', 'ASC']]
    });

    console.log('Found pending verifications count:', verifications.length);
    res.json({
      success: true,
      count: verifications.length,
      verifications
    });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verifications'
    });
  }
});

// Get specific verification details (Admin only)
// Get all verifications with filters (Admin only)
router.get('/admin/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  console.log('⤴️  GET /api/verification/admin/all called - auth header present?', !!req.headers.authorization);
  try {
    const { status, verified } = req.query;
    const where = {};

    if (status) where.status = status;
    if (verified === 'true') {
      where.status = 'verified';
    }

    const verifications = await TenantVerification.findAll({
      where,
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: verifications.length,
      verifications
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verifications'
    });
  }
});

// Get specific verification details (Admin only)
router.get('/admin/:id', authenticateToken, authorizeRole('admin'), async (req, res) => {
  console.log('⤴️  GET /api/verification/admin/:id called - id:', req.params.id, 'auth header?', !!req.headers.authorization, 'user:', req.user && (req.user.id || req.user));
  try {
    const verification = await TenantVerification.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'email', 'phone', 'created_at', 'role']
      }]
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }

    res.json({
      success: true,
      verification
    });
  } catch (error) {
    console.error('Error fetching verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verification'
    });
  }
});

// Approve/Reject verification (Admin only)
router.put('/admin/:id/review', authenticateToken, authorizeRole('admin'), async (req, res) => {
  console.log('⤴️  PUT /api/verification/admin/:id/review called - id:', req.params.id, 'auth header?', !!req.headers.authorization, 'user:', req.user && (req.user.id || req.user));
  try {
    const { id } = req.params;
    const {
      status,
      id_verified,
      employment_verified,
      financial_verified,
      references_verified,
      rejection_reason,
      admin_notes
    } = req.body;

    const verification = await TenantVerification.findByPk(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found'
      });
    }

    await verification.update({
      status,
      id_verified: id_verified !== undefined ? id_verified : verification.id_verified,
      employment_verified: employment_verified !== undefined ? employment_verified : verification.employment_verified,
      financial_verified: financial_verified !== undefined ? financial_verified : verification.financial_verified,
      references_verified: references_verified !== undefined ? references_verified : verification.references_verified,
      rejection_reason,
      admin_notes,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    res.json({
      success: true,
      message: `Verification ${status}`,
      verification
    });
  } catch (error) {
    console.error('Error reviewing verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review verification'
    });
  }
});

// Get all verifications with filters (Admin only)
router.get('/admin/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
  console.log('⤴️  GET /api/verification/admin/all called - auth header present?', !!req.headers.authorization);
  try {
    const { status, verified } = req.query;
    const where = {};

    if (status) where.status = status;
    if (verified === 'true') {
      where.status = 'verified';
    }

    const verifications = await TenantVerification.findAll({
      where,
      include: [{
        model: User,
        as: 'tenant',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: verifications.length,
      verifications
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch verifications'
    });
  }
});

// Setup associations
TenantVerification.belongsTo(User, { foreignKey: 'tenant_id', as: 'tenant' });
TenantVerification.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

export default router;
