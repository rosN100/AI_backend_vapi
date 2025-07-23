// Test script to demonstrate property-based VAPI calls
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3000';

// Sample property data (from the CSV)
const samplePropertyData = {
  property_id: "LP001",
  property_name: "Oberoi Sky City",
  location: "Borivali East",
  area_sqft: 1850,
  bedrooms: 3,
  bathrooms: 3,
  price_crores: 4.2,
  price_per_sqft: 22703,
  property_type: "Apartment",
  builder: "Oberoi Realty",
  possession_status: "Ready to Move",
  amenities: "Swimming Pool, Gym, Club House, Security",
  contact_person: "Rajesh Sharma",
  phone_number: "+91-9876543210", // Replace with your test number
  email: "rajesh.sharma@email.com",
  lead_status: "Hot Lead",
  last_contacted: "2025-01-15",
  notes: "Interested in 3BHK"
};

async function testPropertyCall() {
  try {
    console.log('🧪 Testing property-based VAPI call...');
    console.log('📋 Property:', samplePropertyData.property_name);
    console.log('📞 Calling:', samplePropertyData.contact_person);
    
    const response = await fetch(`${SERVER_URL}/trigger-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(samplePropertyData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Call initiated successfully!');
    console.log('📋 Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing property call:', error.message);
  }
}

// Run the test
testPropertyCall();
