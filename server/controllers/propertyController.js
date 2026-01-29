import Property from '../models/Property.js';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { geocodeAddress } from '../utils/geocoding.js';

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
    
    // include landlord info when returning properties
    queryOptions.include = [{ model: User, as: 'landlord', attributes: ['id', 'name', 'email'] }];
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
      images,
      address,
      video_url
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
      images: images || [],
      address: address || null,
      video_url: video_url || null
    };

    // Document fields (landlord identity document)
    const { document_url, document_filename, document_type } = req.body;
    if (document_url) {
      propertyData.document_url = document_url;
      propertyData.document_filename = document_filename || null;
      propertyData.document_type = document_type || null;
      propertyData.document_uploaded_at = new Date();
      propertyData.document_verified = false; // reset on new upload
    }

    // amenities and flags
    const { wifi_available, pets_allowed, furnished, parking_available, amenities } = req.body;
    propertyData.wifi_available = wifi_available !== undefined ? !!wifi_available : false;
    propertyData.pets_allowed = pets_allowed !== undefined ? !!pets_allowed : false;
    propertyData.furnished = furnished !== undefined ? !!furnished : false;
    propertyData.parking_available = parking_available !== undefined ? !!parking_available : false;
    if (amenities !== undefined) {
      propertyData.amenities = Array.isArray(amenities)
        ? amenities
        : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()).filter(Boolean) : []);
    } else {
      propertyData.amenities = [];
    }
    
    // Geocode address if provided, otherwise use city
    try {
      const coords = await geocodeAddress(address, location);
      if (coords) {
        propertyData.latitude = coords.lat;
        propertyData.longitude = coords.lon;
        console.log('Geocoded coordinates:', coords);
      }
    } catch (geocodeError) {
      console.log('Geocoding failed, continuing without coordinates:', geocodeError.message);
    }
    
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

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: 'Property not found' 
      });
    }
    
    // Only allow landlord owner to update
    if (property.landlord_id !== req.body.landlord_id && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this property' 
      });
    }
    
    const { 
      title, 
      description, 
      price, 
      location, 
      bedrooms,
      bathrooms,
      property_type,
      image_url,
      images,
      address,
      video_url
    } = req.body;
    
    const updateData = {
      title: title || property.title,
      description: description || property.description,
      price: price !== undefined ? price : property.price,
      location: location || property.location,
      bedrooms: bedrooms !== undefined ? bedrooms : property.bedrooms,
      bathrooms: bathrooms !== undefined ? bathrooms : property.bathrooms,
      property_type: property_type || property.property_type,
      image_url: image_url || property.image_url,
      images: images || property.images,
      address: address !== undefined ? address : property.address,
      video_url: video_url !== undefined ? video_url : property.video_url
    };

    // document handling for update: if document provided and changed, reset verification
    const { document_url, document_filename, document_type } = req.body;
    if (document_url && document_url !== property.document_url) {
      updateData.document_url = document_url;
      updateData.document_filename = document_filename || property.document_filename;
      updateData.document_type = document_type || property.document_type;
      updateData.document_uploaded_at = new Date();
      updateData.document_verified = false;
      updateData.document_verified_by = null;
      updateData.document_review_notes = null;
    } else {
      updateData.document_url = property.document_url;
      updateData.document_filename = property.document_filename;
      updateData.document_type = property.document_type;
      updateData.document_uploaded_at = property.document_uploaded_at;
      updateData.document_verified = property.document_verified;
      updateData.document_verified_by = property.document_verified_by;
      updateData.document_review_notes = property.document_review_notes;
    }

    // amenities and flags for update
    const { wifi_available, pets_allowed, furnished, parking_available, amenities } = req.body;
    updateData.wifi_available = wifi_available !== undefined ? !!wifi_available : property.wifi_available;
    updateData.pets_allowed = pets_allowed !== undefined ? !!pets_allowed : property.pets_allowed;
    updateData.furnished = furnished !== undefined ? !!furnished : property.furnished;
    updateData.parking_available = parking_available !== undefined ? !!parking_available : property.parking_available;
    if (amenities !== undefined) {
      updateData.amenities = Array.isArray(amenities)
        ? amenities
        : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()).filter(Boolean) : []);
    } else {
      updateData.amenities = property.amenities || [];
    }
    
    // Geocode address if changed
    if (address && address !== property.address) {
      try {
        const coords = await geocodeAddress(address, location);
        if (coords) {
          updateData.latitude = coords.lat;
          updateData.longitude = coords.lon;
        }
      } catch (geocodeError) {
        console.log('Geocoding failed:', geocodeError.message);
      }
    }
    
    await property.update(updateData);
    
    res.json({ 
      success: true,
      property 
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: 'Property not found' 
      });
    }
    
    // Only allow landlord owner or admin to delete
    const landlordId = req.body.landlord_id || req.query.landlord_id;
    if (property.landlord_id !== landlordId && req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this property' 
      });
    }
    
    await property.destroy();
    
    res.json({ 
      success: true,
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin: list properties with uploaded documents pending verification
export const getPendingDocuments = async (req, res) => {
  try {
    const pending = await Property.findAll({
      where: {
        document_url: { [Op.ne]: null },
        document_verified: false
      },
      include: [{ model: User, as: 'landlord', attributes: ['id', 'name', 'email'] }],
      order: [['document_uploaded_at', 'DESC']]
    });

    res.json({ success: true, pending });
  } catch (error) {
    console.error('Get pending documents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: verify or reject an uploaded document for a property
export const verifyDocument = async (req, res) => {
  try {
    const { id } = req.params; // property id
    const { verified, notes } = req.body;

    // only admin
    if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    const property = await Property.findByPk(id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    property.document_verified = !!verified;
    property.document_verified_by = req.user?.id || 'admin';
    property.document_review_notes = notes || null;
    await property.save();

    res.json({ success: true, property });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};