-- Add multi-user support to existing schema
-- Step 1: Add user_id column to leads table
ALTER TABLE leads 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Step 2: Add index for better performance
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_user_status ON leads(user_id, status);

-- Step 3: Add user_id to call_records table as well
ALTER TABLE call_records 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE INDEX idx_call_records_user_id ON call_records(user_id);

-- Step 4: Update existing leads to belong to admin user (temporary)
-- First, get the admin user ID
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID from user_profiles
    SELECT auth_user_id INTO admin_user_id 
    FROM user_profiles 
    WHERE email = 'admin@soraaya.ai' 
    LIMIT 1;
    
    -- Update existing leads to belong to admin
    IF admin_user_id IS NOT NULL THEN
        UPDATE leads SET user_id = admin_user_id WHERE user_id IS NULL;
        UPDATE call_records SET user_id = admin_user_id WHERE user_id IS NULL;
        
        RAISE NOTICE 'Updated existing records to belong to admin user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found, please create admin user first';
    END IF;
END $$;

-- Step 5: Make user_id NOT NULL after updating existing records
ALTER TABLE leads ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE call_records ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Add RLS policies for multi-tenant security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own leads
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" ON leads
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users can only see their own call records
CREATE POLICY "Users can view own call records" ON call_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own call records" ON call_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 7: Create a function to get user's leads for calling
CREATE OR REPLACE FUNCTION get_user_leads_for_calling(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    contact_person TEXT,
    phone_number TEXT,
    company_name TEXT,
    status TEXT,
    priority INTEGER,
    follow_up_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.contact_person,
        l.phone_number,
        l.company_name,
        l.status,
        l.priority,
        l.follow_up_count,
        l.created_at
    FROM leads l
    WHERE l.user_id = p_user_id
      AND (
          l.status = 'to_call' OR 
          l.status = 'callback_requested' OR 
          l.status = 'call_failed' OR 
          (l.status = 'follow_up' AND l.follow_up_count <= 2)
      )
    ORDER BY l.priority DESC, l.created_at ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to get user's call statistics
CREATE OR REPLACE FUNCTION get_user_call_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_leads', COUNT(*),
        'to_call', COUNT(*) FILTER (WHERE status = 'to_call'),
        'calling', COUNT(*) FILTER (WHERE status = 'calling'),
        'completed_today', (
            SELECT COUNT(*) 
            FROM call_records cr 
            WHERE cr.user_id = p_user_id 
              AND DATE(cr.created_at) = CURRENT_DATE
        ),
        'qualified_leads', COUNT(*) FILTER (WHERE status = 'qualified'),
        'not_interested', COUNT(*) FILTER (WHERE status = 'not_interested')
    ) INTO result
    FROM leads l
    WHERE l.user_id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
