import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { property_id, tenant_id, move_in_date, move_out_date, message, landlord_id } = req.body;

    console.log('Booking request received:', { property_id, tenant_id, move_in_date, landlord_id });

    if (!property_id || !tenant_id || !move_in_date) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, tenant ID, and move-in date are required'
      });
    }

    // Try to get property details from MySQL, but don't fail if it doesn't exist
    // Properties might be in Supabase only
    let propertyLandlordId = landlord_id;
    try {
      const property = await Property.findByPk(property_id);
      if (property && property.landlord_id) {
        propertyLandlordId = property.landlord_id;
      }
    } catch (error) {
      console.log('Property not found in MySQL, using provided landlord_id or default');
    }

    // If no landlord_id provided or found, use a placeholder
    // The landlord will need to be notified through another mechanism
    if (!propertyLandlordId) {
      propertyLandlordId = 'pending-landlord-assignment';
    }

    // Create booking
    const booking = await Booking.create({
      property_id,
      tenant_id,
      landlord_id: propertyLandlordId,
      move_in_date,
      move_out_date,
      message,
      status: 'pending'
    });

    console.log('Booking created successfully:', booking.id);

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get tenant's bookings
export const getTenantBookings = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const bookings = await Booking.findAll({
      where: { tenant_id: tenantId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching tenant bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get landlord's bookings
export const getLandlordBookings = async (req, res) => {
  try {
    const { landlordId } = req.params;

    const bookings = await Booking.findAll({
      where: { landlord_id: landlordId },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching landlord bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Update booking status (landlord only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, landlordId } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify landlord owns this booking
    if (booking.landlord_id !== landlordId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this booking'
      });
    }

    booking.status = status;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// Get single booking details
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Cancel booking (tenant can cancel own bookings)
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { tenantId } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify tenant owns this booking
    if (booking.tenant_id !== tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};
