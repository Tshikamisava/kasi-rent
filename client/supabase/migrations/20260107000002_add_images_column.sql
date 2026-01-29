-- Add images column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.properties.images IS 'Array of image URLs for property photos';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_images ON public.properties USING GIN (images);
