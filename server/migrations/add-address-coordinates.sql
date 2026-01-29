-- Migration: Add address and GPS coordinates to properties table
-- This enables precise location mapping with full street addresses

-- Add address field (optional street address)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT NULL
COMMENT 'Full street address of property';

-- Add latitude coordinate
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) DEFAULT NULL
COMMENT 'GPS latitude coordinate';

-- Add longitude coordinate
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) DEFAULT NULL
COMMENT 'GPS longitude coordinate';

-- Add index for spatial queries (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_coordinates ON properties(latitude, longitude);

-- Update existing properties with city-level coordinates (optional)
-- This ensures backward compatibility
-- Note: Run this only if you want to geocode existing properties
