-- Migration: add document verification columns to properties
ALTER TABLE properties
  ADD COLUMN document_url VARCHAR(1024) DEFAULT NULL,
  ADD COLUMN document_filename VARCHAR(255) DEFAULT NULL,
  ADD COLUMN document_type VARCHAR(100) DEFAULT NULL,
  ADD COLUMN document_uploaded_at DATETIME DEFAULT NULL,
  ADD COLUMN document_verified TINYINT(1) DEFAULT 0,
  ADD COLUMN document_verified_by VARCHAR(255) DEFAULT NULL,
  ADD COLUMN document_review_notes TEXT DEFAULT NULL;

-- Backfill: set defaults for existing rows (optional)
UPDATE properties SET document_verified = 0 WHERE document_verified IS NULL;
