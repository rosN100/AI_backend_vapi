-- Create admin user only (safe to run multiple times)
-- Password: 'admin123' (hashed with bcrypt)

-- First, let's check if the user already exists
SELECT email, full_name, role, status FROM users WHERE email = 'admin@soraaya.ai';

-- Insert admin user (will skip if already exists due to ON CONFLICT)
INSERT INTO users (email, password_hash, full_name, role, status) 
VALUES (
  'admin@soraaya.ai', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'System Administrator', 
  'admin', 
  'active'
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  full_name = 'System Administrator',
  role = 'admin',
  status = 'active',
  updated_at = NOW();

-- Verify the admin user was created/updated
SELECT 
  email, 
  full_name, 
  role, 
  status, 
  created_at, 
  updated_at 
FROM users 
WHERE email = 'admin@soraaya.ai';
