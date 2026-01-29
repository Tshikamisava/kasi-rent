-- Tenant Verification Documents Table
CREATE TABLE IF NOT EXISTS tenant_verifications (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  
  -- Personal Information
  id_number VARCHAR(50),
  id_document_url VARCHAR(500),
  id_verified BOOLEAN DEFAULT FALSE,
  
  -- Employment Information
  employment_status ENUM('employed', 'self-employed', 'student', 'unemployed'),
  employer_name VARCHAR(255),
  employment_letter_url VARCHAR(500),
  monthly_income DECIMAL(10,2),
  employment_verified BOOLEAN DEFAULT FALSE,
  
  -- Financial Information
  bank_statement_url VARCHAR(500),
  credit_score INTEGER,
  credit_report_url VARCHAR(500),
  financial_verified BOOLEAN DEFAULT FALSE,
  
  -- References
  previous_landlord_name VARCHAR(255),
  previous_landlord_phone VARCHAR(20),
  previous_landlord_email VARCHAR(255),
  reference_letter_url VARCHAR(500),
  references_verified BOOLEAN DEFAULT FALSE,
  
  -- Admin Review
  reviewed_by VARCHAR(36),
  reviewed_at DATETIME,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_status (status)
);

-- Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Search Filters
  location VARCHAR(255),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type VARCHAR(50),
  furnished BOOLEAN,
  pets_allowed BOOLEAN,
  utilities_included BOOLEAN,
  move_in_date DATE,
  
  -- Notification Settings
  email_alerts BOOLEAN DEFAULT TRUE,
  alert_frequency ENUM('instant', 'daily', 'weekly') DEFAULT 'daily',
  last_alert_sent DATETIME,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);

-- Add verification columns to properties table
-- These columns will be added one by one, ignoring errors if they already exist
ALTER TABLE properties ADD COLUMN furnished BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN pets_allowed BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN utilities_included BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN available_from DATE;
ALTER TABLE properties ADD COLUMN parking_spaces INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN amenities JSON;
