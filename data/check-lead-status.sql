-- Check current lead statuses and phone numbers
SELECT 
    id,
    contact_person,
    phone_number,
    status,
    follow_up_count,
    created_at
FROM leads 
ORDER BY created_at;

-- Count by status
SELECT 
    status,
    COUNT(*) as count
FROM leads 
GROUP BY status
ORDER BY count DESC;

-- Check which leads would be selected for calling
SELECT 
    id,
    contact_person,
    phone_number,
    status,
    follow_up_count,
    priority
FROM leads 
WHERE (
    status = 'to_call' OR 
    status = 'callback_requested' OR 
    status = 'call_failed' OR 
    (status = 'follow_up' AND follow_up_count <= 2)
)
ORDER BY priority DESC, created_at ASC;
