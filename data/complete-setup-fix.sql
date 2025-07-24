-- Complete setup fix for user permissions and admin user

-- First, let's recreate the user_profiles table with a better structure
-- that can handle users who don't exist in auth.users yet

DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User Information
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Permission System
    role VARCHAR(50) DEFAULT 'general_user' CHECK (role IN ('admin', 'general_user')),
    
    -- Permissions (can be extended in future)
    can_manage_leads BOOLEAN DEFAULT false,
    can_start_campaigns BOOLEAN DEFAULT false,
    can_view_analytics BOOLEAN DEFAULT true,
    can_export_data BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update timestamp trigger
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS TEXT AS $$
BEGIN
    UPDATE user_profiles 
    SET 
        role = 'admin',
        can_manage_leads = true,
        can_start_campaigns = true,
        can_view_analytics = true,
        can_export_data = true,
        updated_at = NOW()
    WHERE email = user_email;
    
    IF FOUND THEN
        RETURN 'User promoted to admin successfully';
    ELSE
        RETURN 'User not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the admin user profile
INSERT INTO user_profiles (email, full_name, role, can_manage_leads, can_start_campaigns, can_view_analytics, can_export_data)
VALUES (
    'admin@soraaya.ai',
    'System Administrator',
    'admin',
    true,
    true,
    true,
    true
);

-- Verify the setup
SELECT 
    id,
    auth_user_id,
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
