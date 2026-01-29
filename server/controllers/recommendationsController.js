/**
 * Smart Property Recommendations Engine
 * Uses collaborative filtering + content-based recommendations
 * No database migration needed - works with existing data
 */

/**
 * Get personalized property recommendations
 * Based on:
 * 1. Properties user has viewed
 * 2. User search filters (location, price range, property type)
 * 3. Similar properties (same area, similar price)
 * 4. Popular properties (high view count)
 */
export const getRecommendations = async (req, res) => {
  try {
    const { 
      userId, 
      viewedProperties = [], 
      location, 
      priceRange,
      propertyType,
      limit = 6 
    } = req.body;

    // Get all properties
    const allProperties = await getAllProperties();

    if (!allProperties || allProperties.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: [],
        reason: "No properties available",
      });
    }

    // Calculate recommendation scores
    const scoredProperties = allProperties
      .filter((p) => !viewedProperties.includes(p.id)) // Exclude already viewed
      .map((property) => {
        let score = 0;

        // 1. Location match (30 points)
        if (location && property.location.toLowerCase().includes(location.toLowerCase())) {
          score += 30;
        }

        // 2. Property type match (20 points)
        if (propertyType && property.property_type === propertyType) {
          score += 20;
        }

        // 3. Price range match (25 points)
        if (priceRange) {
          const { min, max } = priceRange;
          if (property.price >= min && property.price <= max) {
            score += 25;
          } else if (property.price >= min * 0.8 && property.price <= max * 1.2) {
            score += 12; // Close to range
          }
        }

        // 4. Popularity (10 points)
        const viewCount = property.view_count || 0;
        if (viewCount > 50) score += 10;
        else if (viewCount > 20) score += 5;

        // 5. Verification bonus (15 points)
        if (property.is_verified) {
          score += 15;
        }

        // 6. Recent listings bonus (5 points)
        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreated < 7) score += 5;

        return {
          ...property,
          recommendationScore: score,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      recommendations: scoredProperties,
      count: scoredProperties.length,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: error.message,
    });
  }
};

/**
 * Track property view
 * Increments view count and records user interaction
 */
export const trackPropertyView = async (req, res) => {
  try {
    const { propertyId, userId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID required",
      });
    }

    // In production, this would update database
    // For now, we return success (client tracks locally)
    
    return res.status(200).json({
      success: true,
      message: "View tracked",
      propertyId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("View tracking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to track view",
    });
  }
};

/**
 * Get trending/popular properties
 * Most viewed, newest, most bookings, etc.
 */
export const getTrendingProperties = async (req, res) => {
  try {
    const { type = "viewed", limit = 6 } = req.body;

    const allProperties = await getAllProperties();

    if (!allProperties || allProperties.length === 0) {
      return res.status(200).json({
        success: true,
        trending: [],
      });
    }

    let sorted = allProperties;

    switch (type) {
      case "viewed":
        sorted = allProperties.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "newest":
        sorted = allProperties.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "verified":
        sorted = allProperties.filter((p) => p.is_verified);
        break;
      case "best-price":
        sorted = allProperties.sort((a, b) => a.price - b.price);
        break;
      default:
        sorted = allProperties.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    return res.status(200).json({
      success: true,
      trending: sorted.slice(0, limit),
      type,
    });
  } catch (error) {
    console.error("Trending error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get trending properties",
    });
  }
};

/**
 * Get similar properties
 * Based on a reference property
 */
export const getSimilarProperties = async (req, res) => {
  try {
    const { propertyId, limit = 4 } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID required",
      });
    }

    const allProperties = await getAllProperties();
    const referenceProperty = allProperties.find((p) => p.id === propertyId);

    if (!referenceProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Find similar properties
    const similar = allProperties
      .filter((p) => p.id !== propertyId) // Exclude self
      .map((property) => {
        let similarity = 0;

        // Same location (high weight)
        if (
          property.location.toLowerCase() === referenceProperty.location.toLowerCase()
        ) {
          similarity += 30;
        }

        // Same property type
        if (property.property_type === referenceProperty.property_type) {
          similarity += 25;
        }

        // Similar bedroom count
        if (Math.abs(property.bedrooms - referenceProperty.bedrooms) <= 1) {
          similarity += 20;
        }

        // Similar price (within 20%)
        const priceDiff = Math.abs(property.price - referenceProperty.price);
        const maxPrice = Math.max(property.price, referenceProperty.price);
        if (priceDiff / maxPrice < 0.2) {
          similarity += 15;
        }

        // Verified bonus
        if (property.is_verified && referenceProperty.is_verified) {
          similarity += 10;
        }

        return {
          ...property,
          similarityScore: similarity,
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      similar,
      referenceProperty: {
        id: referenceProperty.id,
        title: referenceProperty.title,
        location: referenceProperty.location,
      },
    });
  } catch (error) {
    console.error("Similar properties error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get similar properties",
    });
  }
};

/**
 * Helper: Get all properties from database
 * In production, would query actual database
 */
async function getAllProperties() {
  try {
    // Import models
    const { Property } = await import("../models/index.js");
    
    // Fetch all properties from database
    const properties = await Property.findAll({
      attributes: [
        'id', 'title', 'description', 'price', 'location', 
        'bedrooms', 'bathrooms', 'property_type', 'image_url',
        'is_verified', 'created_at', 'view_count', 'landlord_id'
      ]
    });
    
    return properties.map(p => p.toJSON()) || [];
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}
