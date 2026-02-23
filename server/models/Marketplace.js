// server/models/Marketplace.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/mysql.js';

const MarketplaceItem = sequelize.define('marketplace_items', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  images: {
    type: DataTypes.TEXT, // Store as JSON string
    get() {
      const raw = this.getDataValue('images');
      return raw ? JSON.parse(raw) : [];
    },
    set(val) {
      this.setDataValue('images', JSON.stringify(val));
    },
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});

export default MarketplaceItem;
