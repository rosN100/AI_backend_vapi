-- Setup admin user for admin@soraaya.ai (Fixed version)

-- First, let's modify the user_profiles table to allow email-only profiles
-- This is needed because the user might not exist in auth.users yet
ALTER TABLE user_profiles ALTER COLUMN id DROP NOT NULL;

-- Create or update the user profile for admin@soraaya.ai
-- We'll insert without the id field since the user doesn't exist in auth.users yet
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
    id,
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
