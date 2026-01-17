import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const TenantVerification = sequelize.define('TenantVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  
  // Personal Information
  id_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  id_document_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  id_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Employment Information
  employment_status: {
    type: DataTypes.ENUM('employed', 'self-employed', 'student', 'unemployed'),
    allowNull: true
  },
  employer_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  employment_letter_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  monthly_income: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  employment_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Financial Information
  bank_statement_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  credit_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  credit_report_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  financial_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // References
  previous_landlord_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  previous_landlord_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  previous_landlord_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference_letter_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  references_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Admin Review
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'tenant_verifications',
  timestamps: true,
  underscored: true
});

export default TenantVerification;
