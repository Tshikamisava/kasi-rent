import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const SavedSearch = sequelize.define('SavedSearch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Search Filters
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  min_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  max_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  property_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  furnished: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  pets_allowed: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  utilities_included: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  move_in_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Notification Settings
  email_alerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  alert_frequency: {
    type: DataTypes.ENUM('instant', 'daily', 'weekly'),
    defaultValue: 'daily'
  },
  last_alert_sent: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'saved_searches',
  timestamps: true,
  underscored: true
});

export default SavedSearch;
