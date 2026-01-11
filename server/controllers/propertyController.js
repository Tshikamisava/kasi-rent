import Property from '../models/Property.js';
import { geocodeAddress } from '../utils/geocoding.js';
import { Op } from 'sequelize';

export const getProperties = async (req, res) => {
  try {
    const { 
      landlord_id, 
      limit, 
      is_verified,
      search,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      property_type,
      sortBy,
      sortOrder
    } = req.query;
    
    const queryOptions = {
      order: []
    };
    
    // Build where clause
    const whereClause = {};
    
    if (landlord_id) {
      whereClause.landlord_id = landlord_id;
    }
    
    if (is_verified !== undefined) {
      whereClause.is_verified = is_verified === 'true';
    }
    
    // Search in title, description, or location
    if (search && search.trim().length > 0) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { location: { [Op.like]: `%${search.trim()}%` } }
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) {
        whereClause.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereClause.price[Op.lte] = parseFloat(maxPrice);
      }
    }
    
    // Bedrooms filter
    if (bedrooms) {
      if (bedrooms === '5+') {
        whereClause.bedrooms = { [Op.gte]: 5 };
      } else {
        whereClause.bedrooms = parseInt(bedrooms);
      }
    }
    
    // Bathrooms filter
    if (bathrooms) {
      if (bathrooms === '3+') {
        whereClause.bathrooms = { [Op.gte]: 3 };
      } else {
        whereClause.bathrooms = parseInt(bathrooms);
      }
    }
    
    // Property type filter
    if (property_type && property_type !== 'all') {
      whereClause.property_type = property_type;
    }
    
    if (Object.keys(whereClause).length > 0) {
      queryOptions.where = whereClause;
    }
    
    // Sorting
    const validSortFields = ['price', 'created_at', 'title', 'bedrooms', 'bathrooms'];
    const sortField = sortBy && validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    queryOptions.order = [[sortField, sortDirection]];
    
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
      address,
      landlord_id,
      bedrooms,
      bathrooms,
      property_type,
      image_url,
      images
    } = req.body;
    
    // Validation: Required fields
    const validationErrors = [];
    
    console.log('Validating title:', title, 'Length:', title ? title.trim().length : 0);
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      validationErrors.push('Title is required');
    } else if (title.trim().length < 5) {
      validationErrors.push('Title must be at least 5 characters');
    } else if (title.trim().length > 200) {
      validationErrors.push('Title must not exceed 200 characters');
    }
    
    console.log('After title validation, errors:', validationErrors);
    
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      validationErrors.push('Location is required');
    } else if (location.trim().length < 2) {
      validationErrors.push('Location must be at least 2 characters');
    }
    
    if (price === undefined || price === null || isNaN(price) || parseFloat(price) <= 0) {
      validationErrors.push('Valid price is required (must be greater than 0)');
    } else if (parseFloat(price) > 1000000) {
      validationErrors.push('Price seems unrealistic (max: R1,000,000)');
    }
    
    if (!landlord_id && !req.user?.id) {
      validationErrors.push('Landlord ID is required');
    }
    
    // Validation: Optional fields with constraints
    if (bedrooms !== undefined && bedrooms !== null && (isNaN(bedrooms) || parseInt(bedrooms) < 0 || parseInt(bedrooms) > 50)) {
      validationErrors.push('Bedrooms must be between 0 and 50');
    }
    
    if (bathrooms !== undefined && bathrooms !== null) {
      const bathroomsNum = parseInt(bathrooms);
      if (isNaN(bathroomsNum) || bathroomsNum < 1 || bathroomsNum > 20) {
        validationErrors.push('Bathrooms must be between 1 and 20');
      }
    }
    
    if (property_type && !['House', 'Apartment', 'Townhouse', 'Studio', 'house', 'apartment', 'townhouse', 'studio'].includes(property_type)) {
      validationErrors.push('Invalid property type. Must be House, Apartment, Townhouse, or Studio');
    }
    
    if (description && description.length > 5000) {
      validationErrors.push('Description must not exceed 5000 characters');
    }
    
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const propertyData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price),
      location: location.trim(),
      address: address ? address.trim() : null,
      landlord_id: landlord_id || req.user?.id || 'temp-id',
      bedrooms: bedrooms ? parseInt(bedrooms) : 0,
      bathrooms: bathrooms ? parseInt(bathrooms) : 1,
      property_type: property_type || 'house',
      image_url: image_url || null,
      images: images || []
    };
    
    // If address is provided, try to geocode it
    if (address && address.trim().length > 0) {
      console.log('Geocoding address:', address);
      try {
        const geocodeResult = await geocodeAddress(address.trim(), location.trim());
        if (geocodeResult) {
          propertyData.latitude = geocodeResult.latitude;
          propertyData.longitude = geocodeResult.longitude;
          console.log('Geocoded successfully:', geocodeResult);
        } else {
          console.log('Geocoding returned no results');
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Continue without coordinates - don't fail the property creation
      }
    }
    
    console.log('Creating property with validated data:', propertyData);
    
    const property = await Property.create(propertyData);
    
    console.log('Property created successfully:', property.id);
    
    res.status(201).json({ 
      success: true,
      property,
      message: 'Property created successfully'
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
    const updateData = req.body;
    
    const property = await Property.findByPk(id);
    
    if (!property) {
      return res.status(404).json({ 
        success: false,
        message: 'Property not found' 
      });
    }
    
    // If address is being updated, try to geocode it
    if (updateData.address && updateData.address.trim().length > 0) {
      try {
        const geocodeResult = await geocodeAddress(updateData.address.trim(), updateData.location || property.location);
        if (geocodeResult) {
          updateData.latitude = geocodeResult.latitude;
          updateData.longitude = geocodeResult.longitude;
        }
      } catch (geocodeError) {
        console.error('Geocoding error during update:', geocodeError);
      }
    }
    
    await property.update(updateData);
    
    res.json({ 
      success: true,
      property,
      message: 'Property updated successfully'
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