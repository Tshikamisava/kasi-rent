import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Reaction = sequelize.define('Reaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  message_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reaction: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'reactions',
  timestamps: true,
  underscored: true,
});

export default Reaction;