-- Add password reset fields to users table
ALTER TABLE users 
ADD COLUMN reset_password_token VARCHAR(255) NULL,
ADD COLUMN reset_password_expires DATETIME NULL;

-- Add index for faster token lookup
ALTER TABLE users ADD INDEX idx_reset_password_token (reset_password_token);
