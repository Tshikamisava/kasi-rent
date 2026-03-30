import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Subscription = sequelize.define('Subscription', {
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
  plan: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'ZAR'
  },
  provider: {
    type: DataTypes.STRING(50),
    defaultValue: 'paystack'
  },
  provider_reference: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending','active','cancelled','expired','past_due'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true
});

export default Subscription;
