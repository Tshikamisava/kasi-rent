import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const UserRole = sequelize.define('UserRole', {
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
  role: {
    type: DataTypes.ENUM('tenant', 'landlord', 'agent', 'admin'),
    allowNull: false
  }
}, {
  tableName: 'user_roles',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'role']
    }
  ]
});

export default UserRole;
