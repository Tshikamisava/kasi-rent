import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  property_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ZAR',
    allowNull: false
  },
  payment_type: {
    type: DataTypes.ENUM('deposit', 'rent', 'application_fee', 'service_fee'),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('card', 'bank_transfer', 'mobile_money'),
    defaultValue: 'card'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  payment_gateway: {
    type: DataTypes.STRING,
    defaultValue: 'paystack'
  },
  gateway_reference: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  gateway_response: {
    type: DataTypes.JSON,
    allowNull: true
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['property_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['gateway_reference']
    }
  ]
});

export default Payment;

