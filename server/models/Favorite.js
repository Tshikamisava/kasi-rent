import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.CHAR(36),
    allowNull: false
  },
  property_id: {
    type: DataTypes.CHAR(36),
    allowNull: false
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['property_id'] },
    { unique: true, fields: ['user_id', 'property_id'] }
  ]
});

export default Favorite;
