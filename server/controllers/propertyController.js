import Property from '../models/Property.js';

export const getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProperty = async (req, res) => {
  try {
    const { title, description, price, location } = req.body;
    
    const property = await Property.create({
      title,
      description,
      price,
      location,
      landlord_id: req.user?.id || 'temp-id',
      images: req.file ? [req.file.path] : []
    });
    
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
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