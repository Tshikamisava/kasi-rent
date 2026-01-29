import Review from '../models/Review.js';
import Property from '../models/Property.js';

// Submit a review
export const submitReview = async (req, res) => {
  try {
    const { property_id, rating, comment, user_id, author_name } = req.body;

    console.log('Review submission received:', { property_id, rating, user_id, author_name });

    if (!property_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, rating, and comment are required'
      });
    }

    // Validate property_id format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(property_id)) {
      console.error('Invalid property ID format:', property_id);
      return res.status(400).json({
        success: false,
        message: `Invalid property ID format: ${property_id}`
      });
    }

    // Try to verify property exists in MySQL, but don't fail if it doesn't
    // Properties might be stored in Supabase only
    try {
      const property = await Property.findByPk(property_id);
      if (property) {
        console.log('Property found in MySQL:', property.id);
      } else {
        console.log('Property not found in MySQL, but continuing (may be in Supabase)');
      }
    } catch (error) {
      console.log('Property lookup error (non-fatal):', error.message);
    }

    const review = await Review.create({
      property_id,
      user_id: user_id || 'anonymous',
      rating: parseInt(rating),
      comment,
      author_name: author_name || 'Anonymous'
    });

    console.log('Review created successfully:', review.id);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
};

// Get reviews for a property
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.findAll({
      where: { property_id: propertyId },
      order: [['created_at', 'DESC']]
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
      : 0;

    res.json({
      success: true,
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

// Delete a review (user's own review)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify user owns the review
    if (review.user_id !== userId && userId !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this review'
      });
    }

    await review.destroy();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};
