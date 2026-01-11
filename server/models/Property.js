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
  address: {
    type: DataTypes.TEXT,
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
  video_url: {
    type: DataTypes.STRING,
    allowNull: true
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
  }
}, {
  tableName: 'properties',
  timestamps: true,
  underscored: true
});

export default Property;




