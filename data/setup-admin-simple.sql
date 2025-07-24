-- Setup admin user for admin@soraaya.ai (Supabase compatible)

-- Create or update the user profile for admin@soraaya.ai
-- This handles the case where the user might not exist in auth.users yet
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
