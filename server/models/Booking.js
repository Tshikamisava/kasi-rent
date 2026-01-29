import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tenant_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  landlord_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  move_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  move_out_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['tenant_id'] },
    { fields: ['landlord_id'] },
    { fields: ['property_id'] },
    { fields: ['status'] }
  ]
});

export default Booking;
