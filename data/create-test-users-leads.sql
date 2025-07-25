-- Create test users
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES 
    ('agent1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', 'user', 'active'),
    ('agent2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Johnson', 'user', 'active'),
    ('agent3@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael Brown', 'user', 'active'),
    ('agent4@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily Davis', 'user', 'active')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs
WITH user_ids AS (
    SELECT id, email FROM users 
    WHERE email IN (
        'agent1@example.com',
        'agent2@example.com',
        'agent3@example.com',
        'agent4@example.com'
    )
)
-- Insert test leads for each user
INSERT INTO leads (
    user_id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    property_address, 
    property_price, 
    property_beds, 
    property_baths, 
    property_sqft,
    status,
    created_at,
    updated_at
)
-- Agent 1 leads
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent1@example.com'),
    'Robert', 'Wilson', 'robert.wilson@example.com', '+15551234567',
    '123 Park Ave, New York, NY', 1250000, 3, 2, 1800, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent1@example.com'),
    'Jennifer', 'Lee', 'jennifer.lee@example.com', '+15552345678',
    '456 Central Park W, New York, NY', 1850000, 4, 3, 2200, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent1@example.com'),
    'David', 'Kim', 'david.kim@example.com', '+15553456789',
    '789 5th Ave, New York, NY', 3200000, 5, 4, 3500, 'to_call', NOW(), NOW()

-- Agent 2 leads
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent2@example.com'),
    'Lisa', 'Wong', 'lisa.wong@example.com', '+15554567890',
    '101 Hudson St, Jersey City, NJ', 950000, 2, 2, 1200, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent2@example.com'),
    'James', 'Miller', 'james.miller@example.com', '+15555678901',
    '202 Grove St, Jersey City, NJ', 1100000, 3, 2, 1600, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent2@example.com'),
    'Patricia', 'Garcia', 'patricia.garcia@example.com', '+15556789012',
    '303 Washington St, Hoboken, NJ', 1350000, 3, 3, 2000, 'to_call', NOW(), NOW()

-- Agent 3 leads
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent3@example.com'),
    'Daniel', 'Martinez', 'daniel.martinez@example.com', '+15557890123',
    '404 1st St, Hoboken, NJ', 1450000, 4, 3, 2100, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent3@example.com'),
    'Nancy', 'Robinson', 'nancy.robinson@example.com', '+15558901234',
    '505 River Rd, Edgewater, NJ', 1650000, 4, 4, 2300, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent3@example.com'),
    'Matthew', 'Clark', 'matthew.clark@example.com', '+15559012345',
    '606 Boulevard E, Weehawken, NJ', 1950000, 5, 4, 2800, 'to_call', NOW(), NOW()

-- Agent 4 leads
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent4@example.com'),
    'Jessica', 'Rodriguez', 'jessica.rodriguez@example.com', '+15550123456',
    '707 14th St, Hoboken, NJ', 1250000, 3, 2, 1700, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent4@example.com'),
    'Kevin', 'Lewis', 'kevin.lewis@example.com', '+15551234567',
    '808 Garden St, Hoboken, NJ', 1150000, 2, 2, 1400, 'to_call', NOW(), NOW()
UNION ALL
SELECT 
    (SELECT id FROM user_ids WHERE email = 'agent4@example.com'),
    'Laura', 'Walker', 'laura.walker@example.com', '+15552345678',
    '909 Willow Ave, Hoboken, NJ', 950000, 2, 1, 1100, 'to_call', NOW(), NOW();

-- Verify the data
SELECT 
    u.email, 
    u.full_name, 
    COUNT(l.id) as lead_count,
    STRING_AGG(CONCAT(l.first_name, ' ', l.last_name, ' (', l.property_address, ')'), '; ') as leads
FROM 
    users u
LEFT JOIN 
    leads l ON u.id = l.user_id
WHERE 
    u.email LIKE 'agent%@example.com'
GROUP BY 
    u.id, u.email, u.full_name
ORDER BY 
    u.email;
