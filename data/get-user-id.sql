-- Get the admin user ID for testing
SELECT 
    auth_user_id,
    email,
    full_name,
    role
FROM user_profiles 
WHERE email = 'admin@soraaya.ai';
