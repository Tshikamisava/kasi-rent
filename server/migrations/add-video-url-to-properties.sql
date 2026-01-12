-- Add video_url column to properties table
ALTER TABLE properties 
ADD COLUMN video_url VARCHAR(512) DEFAULT NULL
COMMENT 'URL to property video (YouTube, Vimeo, or direct link)';
