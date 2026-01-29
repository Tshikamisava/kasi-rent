import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'attachments',
  timestamps: true,
  underscored: true,
});

export default Attachment;