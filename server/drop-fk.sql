-- Drop foreign key constraints to allow bookings and reviews for Supabase properties

-- Drop FK from reviews table
ALTER TABLE reviews DROP FOREIGN KEY IF EXISTS reviews_ibfk_1;

-- Drop FK from bookings table  
ALTER TABLE bookings DROP FOREIGN KEY IF EXISTS bookings_ibfk_1;

-- Show success message
SELECT 'Foreign key constraints dropped successfully!' AS Status;
