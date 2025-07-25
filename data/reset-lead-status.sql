-- Reset lead status back to 'to_call' for testing
UPDATE leads 
SET status = 'to_call', 
    last_call_attempt = NULL
WHERE id = '4ff54878-88e6-46fa-9428-13a99d864673';

-- Check the updated status
SELECT 
    id,
    contact_person,
    phone_number,
    status,
    last_call_attempt,
    created_at
FROM leads 
WHERE id = '4ff54878-88e6-46fa-9428-13a99d864673';
