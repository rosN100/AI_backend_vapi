-- Setup admin user for admin@soraaya.ai
-- This will create the user profile with admin permissions

-- First, let's see if the user exists in auth.users
-- SELECT id, email FROM auth.users WHERE email = 'admin@soraaya.ai';

-- Create or update the user profile for admin@soraaya.ai
INSERT INTO user_profiles (id, email, full_name, role, can_manage_leads, can_start_campaigns, can_view_analytics, can_export_data)
SELECT 
    auth.users.id,
    auth.users.email,
    'System Administrator',
    'admin',
    true,
    true,
    true,
    true
FROM auth.users 
WHERE auth.users.email = 'admin@soraaya.ai'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    can_manage_leads = true,
    can_start_campaigns = true,
    can_view_analytics = true,
    can_export_data = true,
    updated_at = NOW();

-- If the user doesn't exist in auth.users, we need to create a manual entry
-- This is for testing purposes only
INSERT INTO user_profiles (email, full_name, role, can_manage_leads, can_start_campaigns, can_view_analytics, can_export_data)
VALUES (
    'admin@soraaya.ai',
    'System Administrator',
    'admin',
    true,
    true,
    true,
    true
)
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    can_manage_leads = true,
    can_start_campaigns = true,
    can_view_analytics = true,
    can_export_data = true,
    updated_at = NOW();

-- Verify the setup
SELECT 
    email,
    full_name,
    role,
    can_manage_leads,
    can_start_campaigns,
    can_view_analytics,
    can_export_data,
    created_at
FROM user_profiles 
WHERE email = 'admin@soraaya.ai';
