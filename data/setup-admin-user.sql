-- Setup admin user for testing
-- Replace 'your-email@example.com' with your actual email address

-- First, create the user profile if it doesn't exist
INSERT INTO user_profiles (id, email, full_name, role, can_manage_leads, can_start_campaigns, can_view_analytics, can_export_data)
SELECT 
    auth.users.id,
    auth.users.email,
    COALESCE(auth.users.raw_user_meta_data->>'full_name', auth.users.email),
    'admin',
    true,
    true,
    true,
    true
FROM auth.users 
WHERE auth.users.email = 'your-email@example.com'  -- Replace with your email
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    can_manage_leads = true,
    can_start_campaigns = true,
    can_view_analytics = true,
    can_export_data = true,
    updated_at = NOW();

-- Alternative: Use the helper function if you know your email
-- SELECT public.promote_user_to_admin('your-email@example.com');

-- Verify the setup
SELECT 
    email,
    role,
    can_manage_leads,
    can_start_campaigns,
    can_view_analytics,
    can_export_data
FROM user_profiles 
WHERE email = 'your-email@example.com';  -- Replace with your email
