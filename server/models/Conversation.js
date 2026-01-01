import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('private', 'property'),
    allowNull: false,
    defaultValue: 'private',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  last_message_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true,
});

export default Conversation;