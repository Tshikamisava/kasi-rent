-- Add address and coordinate columns to properties table
ALTER TABLE properties 
ADD COLUMN address TEXT AFTER location,
ADD COLUMN latitude DECIMAL(10, 8) AFTER address,
ADD COLUMN longitude DECIMAL(11, 8) AFTER latitude;

-- Add index for geospatial queries
CREATE INDEX idx_coordinates ON properties(latitude, longitude);
