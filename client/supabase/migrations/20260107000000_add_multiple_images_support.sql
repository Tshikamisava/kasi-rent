-- Add support for multiple images in properties table
-- Change image_url to images array
ALTER TABLE public.properties 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Migrate existing image_url data to images array
UPDATE public.properties 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND image_url != '';

-- Keep image_url for backward compatibility but make it nullable
-- It can be used as the primary/featured image
ALTER TABLE public.properties 
ALTER COLUMN image_url DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.images IS 'Array of image URLs for the property';
COMMENT ON COLUMN public.properties.image_url IS 'Primary/featured image URL (kept for backward compatibility)';
