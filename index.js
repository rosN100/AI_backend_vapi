import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Joi from 'joi';

dotenv.config();

const {
  PORT = 3000,
  VAPI_API_KEY,
  VAPI_ASSISTANT_ID,
  VAPI_PHONE_NUMBER_ID,
  N8N_RESULTS_URL
} = process.env;

const app = express();
app.use(express.json());

// ------------------------------------------------------------
// Validation schemas
// ------------------------------------------------------------
const callSchema = Joi.object({
  // Property Information
  property_id: Joi.string().required(),
  property_name: Joi.string().required(),
  location: Joi.string().required(),
  area_sqft: Joi.number().required(),
  bedrooms: Joi.number().required(),
  bathrooms: Joi.number().required(),
  price_crores: Joi.number().required(),
  price_per_sqft: Joi.number().required(),
  property_type: Joi.string().required(),
  builder: Joi.string().required(),
  possession_status: Joi.string().required(),
  amenities: Joi.string().required(),
  
  // Lead Information
  contact_person: Joi.string().required(),
  phone_number: Joi.string().required(),
  email: Joi.string().email().required(),
  lead_status: Joi.string().required(),
  last_contacted: Joi.string().optional(),
  notes: Joi.string().optional()
});

const resultsSchema = Joi.object({
  candidateId: Joi.string().required(),
  callStatus: Joi.string().required(),
  candidateResponse: Joi.string().required(),
  scheduledTime: Joi.string().required(),
  followUpRequired: Joi.boolean().required(),
  callRecordingUrl: Joi.string().uri().required(),
  transcript: Joi.string().required()
});

// ------------------------------------------------------------
// Configuration validation
// ------------------------------------------------------------
function validateConfiguration() {
  const required = [
    { name: 'VAPI_API_KEY', value: VAPI_API_KEY },
    { name: 'VAPI_ASSISTANT_ID', value: VAPI_ASSISTANT_ID },
    { name: 'VAPI_PHONE_NUMBER_ID', value: VAPI_PHONE_NUMBER_ID },
    { name: 'N8N_RESULTS_URL', value: N8N_RESULTS_URL, pattern: /^https?:\/\// }
  ];

  const errors = [];
  for (const item of required) {
    if (!item.value || item.value.includes('your_') || item.value.includes('_here')) {
      errors.push(`${item.name} is not set or contains placeholder text`);
    } else if (item.pattern && !item.pattern.test(item.value)) {
      errors.push(`${item.name} format appears invalid`);
    }
  }

  if (errors.length) {
    console.error('Configuration Error(s):');
    errors.forEach(e => console.error(` - ${e}`));
    process.exit(1);
  }
  console.log('✅ Configuration validation passed!');
}

// ------------------------------------------------------------
// VAPI call creation
// ------------------------------------------------------------
import { RIYA_SYSTEM_PROMPT, RIYA_INITIAL_GREETING, TODAYS_DATE } from './riya_system_prompt.js';

async function createVapiCall(propertyData) {
  console.log('Today\'s date for VAPI:', TODAYS_DATE);
  
  const callConfig = {
    assistantId: VAPI_ASSISTANT_ID,
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: {
      number: propertyData.phone_number
    },
    // Override assistant settings for this specific call
    assistantOverrides: {
      firstMessage: `Hello ${propertyData.contact_person}, I am Riya from our real estate team. I'm calling about the ${propertyData.property_name} property in ${propertyData.location}. Is this a good time to talk?`,
      
      // Pass property data as dynamic variables
      variableValues: {
        contact_person: propertyData.contact_person,
        property_name: propertyData.property_name,
        location: propertyData.location,
        price_crores: propertyData.price_crores.toString(),
        bedrooms: propertyData.bedrooms.toString(),
        bathrooms: propertyData.bathrooms.toString(),
        area_sqft: propertyData.area_sqft.toString(),
        property_type: propertyData.property_type,
        builder: propertyData.builder,
        possession_status: propertyData.possession_status,
        amenities: propertyData.amenities,
        lead_status: propertyData.lead_status,
        notes: propertyData.notes || 'No specific notes'
      }
    }
  };

  try {
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`
      },
      body: JSON.stringify(callConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VAPI API error (${response.status}): ${errorText}`);
    }

    const callData = await response.json();
    return callData;
  } catch (error) {
    console.error('Error creating VAPI call:', error);
    throw error;
  }
}

async function triggerVapiCall(propertyData) {
  console.log('📞 Creating VAPI call for property:', propertyData.property_name);
  console.log('📱 Calling:', propertyData.contact_person, 'at', propertyData.phone_number);
  
  const vapiCall = await createVapiCall(propertyData);
  console.log('✅ VAPI call initiated:', vapiCall.id);

  console.log('🎉 Outbound phone call initiated via VAPI!');
  console.log(`📋 VAPI Call ID: ${vapiCall.id}`);
  return { 
    callId: vapiCall.id, 
    status: vapiCall.status,
    property_id: propertyData.property_id,
    contact_person: propertyData.contact_person
  };
}

async function postResultsToN8n(results) {
  if (!N8N_RESULTS_URL) {
    console.warn('N8N_RESULTS_URL not configured; skipping posting results');
    return;
  }
  try {
    const res = await fetch(N8N_RESULTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    });
    if (!res.ok) {
      console.error(`Failed posting results to n8n: ${res.status} ${res.statusText}`);
    } else {
      console.log('✅ Posted call results to n8n');
    }
  } catch (err) {
    console.error('Error posting results to n8n:', err.message);
  }
}

// ------------------------------------------------------------
// Express Endpoints
// ------------------------------------------------------------
app.post('/trigger-call', async (req, res) => {
  console.log('--- /trigger-call endpoint HIT ---');

  req.on('data', chunk => console.log('Received chunk:', chunk.toString()));
  req.on('end', () => console.log('Request end'));
  console.log('Parsed req.body:', req.body);

  const { error } = callSchema.validate(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const callInfo = await triggerVapiCall(req.body);
    res.json({ status: 'initiated', data: callInfo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/post-call-results', async (req, res) => {
  const { error } = resultsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  await postResultsToN8n(req.body);
  res.json({ status: 'received' });
});

app.listen(PORT, () => {
  validateConfiguration();
  console.log(`🚀 Server listening on port ${PORT}`);
});
