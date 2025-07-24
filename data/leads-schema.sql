-- Leads table for storing lead information
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Property Information
    property_id VARCHAR(100),
    property_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    area_sqft INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    price_crores DECIMAL(10,2) NOT NULL,
    price_per_sqft DECIMAL(10,2),
    property_type VARCHAR(100) NOT NULL,
    builder VARCHAR(255),
    possession_status VARCHAR(100),
    amenities TEXT,
    
    -- Lead Contact Information
    contact_person VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Lead Status and Tracking
    status VARCHAR(50) DEFAULT 'to_call' CHECK (status IN (
        'to_call', 'follow_up', 'calling', 'in_call', 'qualified', 
        'not_interested', 'callback_requested', 'unresponsive',
        'human_follow_up', 'human_input_needed', 'call_failed'
    )),
    
    -- Call Information
    last_call_id VARCHAR(100),
    last_contacted TIMESTAMPTZ,
    call_scheduled_at TIMESTAMPTZ,
    call_completed_at TIMESTAMPTZ,
    call_failed_at TIMESTAMPTZ,
    call_error TEXT,
    
    -- Follow-up Tracking
    follow_up_count INTEGER DEFAULT 0,
    callback_scheduled_at TIMESTAMPTZ,
    last_call_result TEXT,
    
    -- Call Results
    last_call_summary TEXT,
    last_call_transcript TEXT,
    qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
    
    -- Lead Source and Notes
    lead_source VARCHAR(100) DEFAULT 'manual',
    notes TEXT,
    tags TEXT[], -- Array of tags for categorization
    
    -- Priority and Assignment
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    assigned_to UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_last_contacted ON leads(last_contacted);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all leads (for now - can be restricted later)
CREATE POLICY "Users can view all leads" ON leads
    FOR SELECT USING (true);

-- Policy: Users can insert leads
CREATE POLICY "Users can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

-- Policy: Users can update leads
CREATE POLICY "Users can update leads" ON leads
    FOR UPDATE USING (true);

-- Sample data insertion
INSERT INTO leads (
    property_name, location, area_sqft, bedrooms, bathrooms, 
    price_crores, property_type, builder, possession_status, 
    amenities, contact_person, phone_number, email, 
    lead_source, notes, priority
) VALUES 
(
    'Luxury Villa in Bandra West',
    'Bandra West, Mumbai',
    3500,
    4,
    4,
    15.50,
    'Villa',
    'Prestige Group',
    'Ready to Move',
    'Swimming Pool, Gym, Security, Parking',
    'Rajesh Sharma',
    '+919876543210',
    'rajesh.sharma@email.com',
    'website',
    'High-value lead from website inquiry',
    8
),
(
    'Sea View Apartment in Worli',
    'Worli, Mumbai',
    2800,
    3,
    3,
    12.75,
    'Apartment',
    'Lodha Group',
    'Under Construction',
    'Sea View, Club House, Concierge',
    'Priya Patel',
    '+919876543211',
    'priya.patel@email.com',
    'referral',
    'Referred by existing client',
    9
),
(
    'Penthouse in Juhu',
    'Juhu, Mumbai',
    4200,
    5,
    5,
    25.00,
    'Penthouse',
    'Oberoi Realty',
    'Ready to Move',
    'Private Terrace, Beach Access, Valet',
    'Amit Gupta',
    '+919876543212',
    'amit.gupta@email.com',
    'advertisement',
    'Responded to luxury magazine ad',
    10
) ON CONFLICT DO NOTHING;
