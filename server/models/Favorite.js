import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  property_id: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favorites',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'property_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['property_id']
    }
  ]
});

export default Favorite;
