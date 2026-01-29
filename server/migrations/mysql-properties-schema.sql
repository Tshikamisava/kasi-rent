-- MySQL Property Table Schema
-- This will be auto-created by Sequelize, but here's the reference

CREATE TABLE IF NOT EXISTS `properties` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `bedrooms` INT DEFAULT 0,
  `bathrooms` INT DEFAULT 0,
  `property_type` VARCHAR(50) DEFAULT 'house',
  `image_url` VARCHAR(500),
  `images` JSON,
  `landlord_id` VARCHAR(255) NOT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `status` ENUM('available', 'rented', 'maintenance') DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample query to check if table exists
SELECT * FROM properties LIMIT 1;
