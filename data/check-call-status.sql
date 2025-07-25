-- Check the current status of our test lead
SELECT 
    id,
    contact_person,
    phone_number,
    status,
    last_call_attempt,
    created_at,
    updated_at
FROM leads 
WHERE id = '4ff54878-88e6-46fa-9428-13a99d864673';

-- Check if any call records were created
SELECT 
    id,
    lead_id,
    call_id,
    status,
    duration,
    created_at
FROM call_records 
WHERE lead_id = '4ff54878-88e6-46fa-9428-13a99d864673'
ORDER BY created_at DESC;
