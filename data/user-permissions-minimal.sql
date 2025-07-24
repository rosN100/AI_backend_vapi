-- User permissions and roles system (Minimal version for Supabase)

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
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
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    UNIQUE(email)
);

-- Create primary key if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_pkey') THEN
        ALTER TABLE user_profiles ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update timestamp trigger
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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
