import express from 'express';
import {
  createBooking,
  getTenantBookings,
  getLandlordBookings,
  updateBookingStatus,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController.js';

const router = express.Router();

// Create new booking
router.post('/', createBooking);

// Get tenant's bookings
router.get('/tenant/:tenantId', getTenantBookings);

// Get landlord's bookings
router.get('/landlord/:landlordId', getLandlordBookings);

// Get single booking
router.get('/:bookingId', getBookingById);

// Update booking status (landlord)
router.put('/:bookingId/status', updateBookingStatus);

// Cancel booking (tenant)
router.put('/:bookingId/cancel', cancelBooking);

export default router;
