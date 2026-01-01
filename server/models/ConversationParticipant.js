import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('participant', 'admin'),
    defaultValue: 'participant',
  },
  last_read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  unread_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'conversation_participants',
  timestamps: true,
  underscored: true,
});

export default ConversationParticipant;