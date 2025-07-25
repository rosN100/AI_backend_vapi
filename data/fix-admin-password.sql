-- Fix admin password to 'admin123'
-- This is the correct bcrypt hash for 'admin123'

UPDATE users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = NOW()
WHERE email = 'admin@soraaya.ai';

-- Verify the update
SELECT email, role, status, updated_at 
FROM users 
WHERE email = 'admin@soraaya.ai';
