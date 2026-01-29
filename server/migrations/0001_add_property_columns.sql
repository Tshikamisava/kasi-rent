-- Migration: add missing columns referenced by propertyController
-- BACKUP your database before running this script.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS document_url VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS document_filename VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS document_type VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS document_uploaded_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS document_verified TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS document_verified_by VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS document_review_notes TEXT NULL,
  ADD COLUMN IF NOT EXISTS wifi_available TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pets_allowed TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS furnished TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parking_available TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amenities JSON NOT NULL DEFAULT (JSON_ARRAY());

-- Note: Some MySQL versions may not support JSON or IF NOT EXISTS on ADD COLUMN.
-- If your MySQL rejects IF NOT EXISTS or JSON default, remove IF NOT EXISTS and
-- set the default to '[]' for amenities, or run the ALTER statements individually.
