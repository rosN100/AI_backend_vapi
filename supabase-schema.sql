-- VAPI Calls Table Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the table

CREATE TABLE vapi_calls (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Call Information
  call_id TEXT UNIQUE NOT NULL,
  status TEXT,
  ended_reason TEXT,
  transcript TEXT,
  recording_url TEXT,
  summary TEXT,
  cost DECIMAL(10,4),
  duration_seconds INTEGER,
  
  -- AI Analysis
  sentiment TEXT,
  intent TEXT,
  key_topics JSONB,
  
  -- Property Information
  property_id TEXT,
  property_name TEXT,
  location TEXT,
  price_crores DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  property_type TEXT,
  builder TEXT,
  possession_status TEXT,
  amenities TEXT,
  
  -- Lead Information
  contact_person TEXT,
  phone_number TEXT,
  email TEXT,
  lead_status TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_vapi_calls_call_id ON vapi_calls(call_id);
CREATE INDEX idx_vapi_calls_phone_number ON vapi_calls(phone_number);
CREATE INDEX idx_vapi_calls_property_id ON vapi_calls(property_id);
CREATE INDEX idx_vapi_calls_created_at ON vapi_calls(created_at);
CREATE INDEX idx_vapi_calls_status ON vapi_calls(status);
CREATE INDEX idx_vapi_calls_sentiment ON vapi_calls(sentiment);

-- Enable Row Level Security (RLS)
ALTER TABLE vapi_calls ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything" ON vapi_calls
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy for authenticated users to read their own data
CREATE POLICY "Users can read call data" ON vapi_calls
  FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE vapi_calls IS 'Stores VAPI call results and associated property/lead information';
COMMENT ON COLUMN vapi_calls.call_id IS 'Unique identifier from VAPI for the call';
COMMENT ON COLUMN vapi_calls.transcript IS 'Full conversation transcript from VAPI';
COMMENT ON COLUMN vapi_calls.key_topics IS 'JSON array of key topics identified by AI';
COMMENT ON COLUMN vapi_calls.cost IS 'Call cost in USD from VAPI';
COMMENT ON COLUMN vapi_calls.duration_seconds IS 'Call duration in seconds';
