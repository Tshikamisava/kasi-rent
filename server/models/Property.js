import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  property_type: {
    type: DataTypes.STRING,
    defaultValue: 'house'
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  landlord_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('available', 'rented', 'maintenance'),
    defaultValue: 'available'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
  ,
  // Landlord identity / verification document
  document_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document_filename: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document_uploaded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  document_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  document_verified_by: {
    type: DataTypes.STRING,
    allowNull: true
  },
  document_review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
  ,
  wifi_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pets_allowed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  furnished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parking_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  amenities: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'properties',
  timestamps: true,
  underscored: true
});

export default Property;




