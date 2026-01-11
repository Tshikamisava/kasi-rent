import Property from '../models/Property.js';

export const getProperties = async (req, res) => {
  try {
    const { landlord_id, limit, is_verified } = req.query;
    
    const queryOptions = {
      order: [['created_at', 'DESC']]
    };
    
    // Build where clause
    const whereClause = {};
    if (landlord_id) {
      whereClause.landlord_id = landlord_id;
    }
    if (is_verified !== undefined) {
      whereClause.is_verified = is_verified === 'true';
    }
    
    if (Object.keys(whereClause).length > 0) {
      queryOptions.where = whereClause;
    }
    
    // Add limit if provided
    if (limit) {
      queryOptions.limit = parseInt(limit);
    }
    
    const properties = await Property.findAll(queryOptions);
    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createProperty = async (req, res) => {
  try {
    console.log('=== CREATE PROPERTY REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { 
      title, 
      description, 
      price, 
      location, 
      landlord_id,
      bedrooms,
      bathrooms,
      property_type,
      image_url,
      images
    } = req.body;
    
    const propertyData = {
      title,
      description,
      price,
      location,
      landlord_id: landlord_id || req.user?.id || 'temp-id',
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      property_type: property_type || 'house',
      image_url: image_url || null,
      images: images || []
    };
    
    console.log('Creating property with data:', propertyData);
    
    const property = await Property.create(propertyData);
    
    console.log('Property created successfully:', property.id);
    
    res.status(201).json({ 
      success: true,
      property 
    });
  } catch (error) {
    console.error('Create property error:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const verifyProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;
    
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Only allow landlord owner or admin to verify
    if (property.landlord_id !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to verify this property' });
    }
    
    property.is_verified = is_verified;
    await property.save();
    
    res.json({ success: true, property });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};