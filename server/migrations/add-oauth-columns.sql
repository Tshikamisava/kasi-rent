-- Add OAuth provider columns to users table
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50) NULL,
ADD COLUMN oauth_id VARCHAR(255) NULL;

ALTER TABLE users
ADD INDEX idx_oauth (oauth_provider, oauth_id);

-- Update password to be nullable for OAuth users
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;
