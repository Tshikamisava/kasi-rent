-- Add video_url column to properties table
ALTER TABLE properties 
ADD COLUMN video_url VARCHAR(500) NULL AFTER images;
