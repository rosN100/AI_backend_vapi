-- Call Analytics table for tracking call timing and performance
CREATE TABLE IF NOT EXISTS call_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Call Information
    call_id VARCHAR(100) NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Timing Information
    call_started_at TIMESTAMPTZ NOT NULL,
    call_ended_at TIMESTAMPTZ,
    call_duration_seconds INTEGER,
    
    -- Call Outcome
    call_status VARCHAR(50) NOT NULL CHECK (call_status IN (
        'answered', 'no_answer', 'busy', 'failed', 'voicemail', 'rejected'
    )),
    
    -- Lead Outcome
    lead_outcome VARCHAR(50) CHECK (lead_outcome IN (
        'qualified', 'not_interested', 'callback_requested', 'follow_up', 'human_needed'
    )),
    
    -- Call Quality Metrics
    answer_time_seconds INTEGER, -- Time to answer
    talk_time_seconds INTEGER,   -- Actual conversation time
    
    -- Additional Data
    phone_number VARCHAR(20),
    lead_source VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_call_analytics_call_started_at ON call_analytics(call_started_at);
CREATE INDEX IF NOT EXISTS idx_call_analytics_call_status ON call_analytics(call_status);
CREATE INDEX IF NOT EXISTS idx_call_analytics_lead_outcome ON call_analytics(lead_outcome);
CREATE INDEX IF NOT EXISTS idx_call_analytics_lead_source ON call_analytics(lead_source);
CREATE INDEX IF NOT EXISTS idx_call_analytics_lead_id ON call_analytics(lead_id);

-- Function to extract hour from timestamp for time-based analytics
CREATE OR REPLACE FUNCTION get_call_hour(call_time TIMESTAMPTZ)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(HOUR FROM call_time AT TIME ZONE 'Asia/Kolkata');
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all call analytics" ON call_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can insert call analytics" ON call_analytics
    FOR INSERT WITH CHECK (true);

-- View for call timing analytics
CREATE OR REPLACE VIEW call_timing_analytics AS
SELECT 
    get_call_hour(call_started_at) as call_hour,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN call_status = 'answered' THEN 1 END) as answered_calls,
    ROUND(
        (COUNT(CASE WHEN call_status = 'answered' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
        1
    ) as answer_rate,
    COUNT(CASE WHEN lead_outcome = 'qualified' THEN 1 END) as qualified_leads,
    ROUND(
        (COUNT(CASE WHEN lead_outcome = 'qualified' THEN 1 END)::DECIMAL / 
         COUNT(CASE WHEN call_status = 'answered' THEN 1 END)) * 100, 
        1
    ) as qualification_rate
FROM call_analytics 
WHERE call_started_at >= NOW() - INTERVAL '30 days'
GROUP BY get_call_hour(call_started_at)
ORDER BY call_hour;

-- View for lead source analytics
CREATE OR REPLACE VIEW lead_source_analytics AS
SELECT 
    COALESCE(ca.lead_source, l.lead_source, 'unknown') as source,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(CASE WHEN l.status = 'qualified' THEN 1 END) as qualified_leads,
    COUNT(CASE WHEN l.status = 'not_interested' THEN 1 END) as not_interested_leads,
    COUNT(CASE WHEN ca.call_status = 'answered' THEN 1 END) as answered_calls,
    COUNT(ca.id) as total_calls,
    ROUND(
        (COUNT(CASE WHEN l.status = 'qualified' THEN 1 END)::DECIMAL / COUNT(DISTINCT l.id)) * 100, 
        1
    ) as qualification_rate,
    ROUND(
        (COUNT(CASE WHEN ca.call_status = 'answered' THEN 1 END)::DECIMAL / COUNT(ca.id)) * 100, 
        1
    ) as answer_rate
FROM leads l
LEFT JOIN call_analytics ca ON l.id = ca.lead_id
WHERE l.created_at >= NOW() - INTERVAL '30 days'
GROUP BY COALESCE(ca.lead_source, l.lead_source, 'unknown')
ORDER BY total_leads DESC;

-- Sample data for testing
INSERT INTO call_analytics (
    call_id, lead_id, call_started_at, call_ended_at, call_duration_seconds,
    call_status, lead_outcome, answer_time_seconds, talk_time_seconds,
    phone_number, lead_source
) 
SELECT 
    'test_call_' || generate_series(1, 100),
    (SELECT id FROM leads ORDER BY RANDOM() LIMIT 1),
    NOW() - (random() * INTERVAL '30 days') + (random() * INTERVAL '12 hours' + INTERVAL '9 hours'), -- Random time between 9 AM and 9 PM in last 30 days
    NOW() - (random() * INTERVAL '30 days') + (random() * INTERVAL '12 hours' + INTERVAL '9 hours') + INTERVAL '2 minutes',
    120 + (random() * 300)::INTEGER, -- 2-7 minutes
    CASE 
        WHEN random() < 0.7 THEN 'answered'
        WHEN random() < 0.85 THEN 'no_answer'
        WHEN random() < 0.95 THEN 'busy'
        ELSE 'failed'
    END,
    CASE 
        WHEN random() < 0.3 THEN 'qualified'
        WHEN random() < 0.6 THEN 'not_interested'
        WHEN random() < 0.8 THEN 'follow_up'
        ELSE 'callback_requested'
    END,
    (random() * 10)::INTEGER, -- 0-10 seconds to answer
    60 + (random() * 240)::INTEGER, -- 1-5 minutes talk time
    '+919876543' || LPAD((random() * 999)::INTEGER::TEXT, 3, '0'),
    CASE 
        WHEN random() < 0.3 THEN 'website'
        WHEN random() < 0.5 THEN 'social_media'
        WHEN random() < 0.7 THEN 'referral'
        WHEN random() < 0.85 THEN 'advertisement'
        ELSE 'cold_call'
    END
FROM generate_series(1, 100)
ON CONFLICT DO NOTHING;
