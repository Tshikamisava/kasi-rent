-- Migration: add amenity fields to properties table
ALTER TABLE `properties`
  ADD COLUMN `wifi_available` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `pets_allowed` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `furnished` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `parking_available` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `amenities` JSON NULL;

-- Verify
SELECT wifi_available, pets_allowed, furnished, parking_available, amenities FROM properties LIMIT 1;
