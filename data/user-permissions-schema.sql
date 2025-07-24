-- User permissions and roles system
-- This extends the existing Supabase auth.users table

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    
    -- User Information
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    
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

-- Update timestamp trigger
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile (except permissions)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Only admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Only admins can update permissions
CREATE POLICY "Admins can update permissions" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, can_manage_leads, can_start_campaigns)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'general_user',  -- Default role
        false,           -- Default: cannot manage leads
        false            -- Default: cannot start campaigns
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    CASE permission_name
        WHEN 'manage_leads' THEN
            SELECT can_manage_leads INTO has_permission
            FROM user_profiles 
            WHERE id = user_id AND is_active = true;
        WHEN 'start_campaigns' THEN
            SELECT can_start_campaigns INTO has_permission
            FROM user_profiles 
            WHERE id = user_id AND is_active = true;
        WHEN 'view_analytics' THEN
            SELECT can_view_analytics INTO has_permission
            FROM user_profiles 
            WHERE id = user_id AND is_active = true;
        WHEN 'export_data' THEN
            SELECT can_export_data INTO has_permission
            FROM user_profiles 
            WHERE id = user_id AND is_active = true;
        ELSE
            has_permission := false;
    END CASE;
    
    RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin (run manually)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_found BOOLEAN := false;
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
    
    GET DIAGNOSTICS user_found = FOUND;
    RETURN user_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample admin user (update with your email)
-- Uncomment and run this to make yourself an admin:
-- SELECT public.promote_user_to_admin('your-email@example.com');
