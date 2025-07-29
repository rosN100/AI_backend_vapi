-- Insert Mumbai Luxury Properties into leads table
-- This script inserts the data from mumbai_luxury_properties.csv into the leads table

INSERT INTO leads (
    property_id,
    property_name,
    location,
    area_sqft,
    bedrooms,
    bathrooms,
    price_crores,
    price_per_sqft,
    property_type,
    builder,
    possession_status,
    amenities,
    contact_person,
    phone_number,
    email,
    status,
    last_contacted,
    notes,
    lead_source,
    priority
) VALUES 
('LP001', 'Oberoi Sky City', 'Borivali East', 1850, 3, 3, 4.2, 22703, 'Apartment', 'Oberoi Realty', 'Ready to Move', 'Swimming Pool, Gym, Club House, Security', 'Rajesh Sharma', '+91-9876543210', 'rajesh.sharma@email.com', 'to_call', '2025-01-15T00:00:00Z', 'Interested in 3BHK', 'mumbai_import', 8),

('LP002', 'Lodha Park', 'Lower Parel', 2200, 4, 4, 8.5, 38636, 'Apartment', 'Lodha Group', 'Under Construction', 'Spa, Tennis Court, Kids Play Area, Concierge', 'Priya Patel', '+91-9876543211', 'priya.patel@email.com', 'to_call', '2025-01-10T00:00:00Z', 'Budget confirmed', 'mumbai_import', 7),

('LP003', 'Palais Royale', 'Worli', 3500, 4, 5, 25.0, 71429, 'Penthouse', 'Palais Royale', 'Ready to Move', 'Private Elevator, Helipad, Butler Service, Wine Cellar', 'Arjun Mehta', '+91-9876543212', 'arjun.mehta@email.com', 'to_call', '2024-12-20T00:00:00Z', 'High-end buyer', 'mumbai_import', 5),

('LP004', 'Trump Tower', 'Worli', 1650, 2, 2, 6.8, 41212, 'Apartment', 'Trump Organization', 'Ready to Move', 'Branded Residences, Concierge, Valet Parking', 'Sneha Gupta', '+91-9876543213', 'sneha.gupta@email.com', 'to_call', '2025-01-18T00:00:00Z', 'Ready to close', 'mumbai_import', 9),

('LP005', 'One Avighna Park', 'Lower Parel', 2800, 4, 4, 12.5, 44643, 'Apartment', 'Oberoi Realty', 'Ready to Move', 'Sky Lounge, Infinity Pool, Private Theatre', 'Vikram Singh', '+91-9876543214', 'vikram.singh@email.com', 'to_call', '2025-01-12T00:00:00Z', 'Negotiating price', 'mumbai_import', 7),

('LP006', 'Lodha Altamount', 'Altamount Road', 4200, 5, 6, 35.0, 83333, 'Penthouse', 'Lodha Group', 'Ready to Move', 'Private Pool, Garden Terrace, Staff Quarters', 'Kavya Nair', '+91-9876543215', 'kavya.nair@email.com', 'to_call', '2025-01-16T00:00:00Z', 'Investment buyer', 'mumbai_import', 8),

('LP007', 'The Imperial', 'Tardeo', 1950, 3, 3, 7.2, 36923, 'Apartment', 'Shapoorji Pallonji', 'Under Construction', 'Rooftop Garden, Yoga Studio, Library', 'Rohit Jain', '+91-9876543216', 'rohit.jain@email.com', 'to_call', '2025-01-08T00:00:00Z', 'First-time buyer', 'mumbai_import', 7),

('LP008', 'Raheja Imperia', 'Worli', 2650, 4, 4, 15.8, 59623, 'Apartment', 'K Raheja Corp', 'Ready to Move', 'Marina View, Private Jetty, Golf Simulator', 'Anita Desai', '+91-9876543217', 'anita.desai@email.com', 'to_call', '2024-12-25T00:00:00Z', 'Price sensitive', 'mumbai_import', 5),

('LP009', 'Indiabulls Sky', 'Lower Parel', 3100, 4, 5, 18.5, 59677, 'Apartment', 'Indiabulls Real Estate', 'Ready to Move', 'Duplex Options, Private Lift, Panoramic Views', 'Suresh Kumar', '+91-9876543218', 'suresh.kumar@email.com', 'to_call', '2025-01-14T00:00:00Z', 'Urgent requirement', 'mumbai_import', 9),

('LP010', 'Lodha World One', 'Lower Parel', 1800, 2, 2, 8.9, 49444, 'Apartment', 'Lodha Group', 'Ready to Move', 'World''s Tallest Residential Tower, Sky Deck', 'Meera Agarwal', '+91-9876543219', 'meera.agarwal@email.com', 'to_call', '2025-01-11T00:00:00Z', 'Downsizing', 'mumbai_import', 7),

('LP011', 'Oberoi Exquisite', 'Goregaon East', 2400, 3, 3, 5.8, 24167, 'Apartment', 'Oberoi Realty', 'Under Construction', 'Clubhouse, Swimming Pool, Landscaped Gardens', 'Deepak Malhotra', '+91-9876543220', 'deepak.malhotra@email.com', 'to_call', '2025-01-17T00:00:00Z', 'Pre-launch booking', 'mumbai_import', 8),

('LP012', 'Hiranandani Gardens', 'Powai', 2100, 3, 3, 4.5, 21429, 'Villa', 'Hiranandani Group', 'Ready to Move', 'Private Garden, Garage, Community Amenities', 'Ritu Kapoor', '+91-9876543221', 'ritu.kapoor@email.com', 'to_call', '2025-01-09T00:00:00Z', 'Family home', 'mumbai_import', 7),

('LP013', 'Kalpataru Paramount', 'Thane', 1900, 3, 2, 3.8, 20000, 'Apartment', 'Kalpataru Group', 'Ready to Move', 'Central Park, Clubhouse, Sports Facilities', 'Amit Verma', '+91-9876543222', 'amit.verma@email.com', 'to_call', '2024-12-30T00:00:00Z', 'Budget constraints', 'mumbai_import', 5),

('LP014', 'Godrej The Trees', 'Vikhroli', 2300, 3, 3, 6.2, 26957, 'Apartment', 'Godrej Properties', 'Under Construction', 'Forest Theme, Tree Court, Eco-friendly', 'Pooja Reddy', '+91-9876543223', 'pooja.reddy@email.com', 'to_call', '2025-01-13T00:00:00Z', 'Green living enthusiast', 'mumbai_import', 8),

('LP015', 'Mahindra Lifespace', 'Bhandup', 2000, 3, 3, 4.1, 20500, 'Apartment', 'Mahindra Lifespace', 'Ready to Move', 'Integrated Township, Schools, Hospital', 'Karan Bhatt', '+91-9876543224', 'karan.bhatt@email.com', 'to_call', '2025-01-07T00:00:00Z', 'Family with kids', 'mumbai_import', 7),

('LP016', 'Tata Housing Primanti', 'Gurgaon Extension', 2500, 4, 3, 5.5, 22000, 'Apartment', 'Tata Housing', 'Under Construction', 'Golf Course View, Clubhouse, Spa', 'Sanjana Shah', '+91-9876543225', 'sanjana.shah@email.com', 'to_call', '2025-01-19T00:00:00Z', 'Golf enthusiast', 'mumbai_import', 8),

('LP017', 'Prestige White Meadows', 'Whitefield Extension', 1750, 2, 2, 3.2, 18286, 'Apartment', 'Prestige Group', 'Ready to Move', 'Tech Park Proximity, Modern Amenities', 'Nikhil Pandey', '+91-9876543226', 'nikhil.pandey@email.com', 'to_call', '2025-01-06T00:00:00Z', 'IT professional', 'mumbai_import', 7),

('LP018', 'Brigade Cornerstone', 'Electronic City', 2200, 3, 3, 4.8, 21818, 'Apartment', 'Brigade Group', 'Under Construction', 'Retail Mall, Office Spaces, Metro Connectivity', 'Rashmi Iyer', '+91-9876543227', 'rashmi.iyer@email.com', 'to_call', '2024-12-28T00:00:00Z', 'Location concerns', 'mumbai_import', 5),

('LP019', 'Sobha City', 'Thanisandra', 2800, 4, 4, 7.5, 26786, 'Villa', 'Sobha Limited', 'Ready to Move', 'Gated Community, Private Pool, Landscaping', 'Gaurav Saxena', '+91-9876543228', 'gaurav.saxena@email.com', 'to_call', '2025-01-15T00:00:00Z', 'Luxury villa seeker', 'mumbai_import', 8),

('LP020', 'DLF Camellias', 'Sector 42, Gurgaon', 4500, 4, 5, 45.0, 100000, 'Penthouse', 'DLF Limited', 'Ready to Move', 'Ultra-luxury, Golf Course View, Private Elevator', 'Manish Agarwal', '+91-9876543229', 'manish.agarwal@email.com', 'to_call', '2025-01-20T00:00:00Z', 'Ultra-luxury seeker', 'mumbai_import', 9);

-- Update the count for verification
SELECT COUNT(*) as total_leads FROM leads WHERE lead_source = 'mumbai_import';
