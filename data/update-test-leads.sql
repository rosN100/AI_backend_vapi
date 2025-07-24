-- Update leads for testing with user's phone number
-- This script updates all leads to use the test phone number
-- and sets appropriate statuses for testing the flow

-- Update all leads with the test phone number
UPDATE leads 
SET phone_number = '+918884154540'
WHERE phone_number IS NOT NULL;

-- Set all leads to 'not_interested' status first
UPDATE leads 
SET status = 'not_interested',
    last_call_result = 'Set for testing - not interested',
    updated_at = NOW()
WHERE status IS NOT NULL;

-- Set only the first lead to 'to_call' status for testing
UPDATE leads 
SET status = 'to_call',
    follow_up_count = 0,
    last_call_result = NULL,
    callback_scheduled_at = NULL,
    last_contacted = NULL,
    call_completed_at = NULL,
    updated_at = NOW()
WHERE id = (
    SELECT id 
    FROM leads 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Display the updated leads for verification
SELECT 
    id,
    property_name,
    contact_person,
    phone_number,
    status,
    follow_up_count,
    priority,
    created_at
FROM leads 
ORDER BY created_at ASC;

-- Show count by status
SELECT 
    status,
    COUNT(*) as count
FROM leads 
GROUP BY status
ORDER BY count DESC;
