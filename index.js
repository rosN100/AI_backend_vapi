import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Joi from 'joi';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const {
  PORT = 3000,
  VAPI_API_KEY,
  VAPI_ASSISTANT_ID,
  VAPI_PHONE_NUMBER_ID,
  N8N_RESULTS_URL,
  GOOGLE_SHEETS_PRIVATE_KEY,
  GOOGLE_SHEETS_CLIENT_EMAIL,
  GOOGLE_SHEETS_SPREADSHEET_ID = '1VJoRrxpzeNYEp8IVgMglj79Abc04OZ9Al1nUPi3mK2w',
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env;

// Initialize Supabase client
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

const app = express();
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Store property data for each call (in-memory, you might want to use a database in production)
const callPropertyData = new Map();

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

// VAPI webhook payload schema for call-ended events
const resultsSchema = Joi.object({
  // Message metadata
  message: Joi.object({
    type: Joi.string().valid('call-ended').required(),
    call: Joi.object({
      id: Joi.string().required(),
      orgId: Joi.string().required(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
      type: Joi.string().required(),
      status: Joi.string().required(),
      phoneNumberId: Joi.string().allow(null),
      customerId: Joi.string().allow(null),
      assistantId: Joi.string().required(),
      squad: Joi.object().allow(null),
      squadId: Joi.string().allow(null),
      webCallUrl: Joi.string().allow(null),
      endedReason: Joi.string().allow(null),
      cost: Joi.number().allow(null),
      costBreakdown: Joi.object().allow(null),
      messages: Joi.array().allow(null),
      transcript: Joi.string().allow(''),
      recordingUrl: Joi.string().uri().allow(null, ''),
      summary: Joi.string().allow(''),
      analysis: Joi.object().allow(null),
      artifact: Joi.object().allow(null),
      monitor: Joi.object().allow(null)
    }).required()
  }).required(),
  
  // Optional: Accept legacy format for backward compatibility
  candidateId: Joi.string().optional(),
  callStatus: Joi.string().optional(),
  candidateResponse: Joi.string().optional(),
  scheduledTime: Joi.string().optional(),
  followUpRequired: Joi.boolean().optional(),
  callRecordingUrl: Joi.string().uri().optional(),
  transcript: Joi.string().optional()
}).or('message', 'candidateId'); // At least one format must be present

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

  const optional = [
    { name: 'GOOGLE_SHEETS_PRIVATE_KEY', value: GOOGLE_SHEETS_PRIVATE_KEY },
    { name: 'GOOGLE_SHEETS_CLIENT_EMAIL', value: GOOGLE_SHEETS_CLIENT_EMAIL },
    { name: 'SUPABASE_URL', value: SUPABASE_URL },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: SUPABASE_SERVICE_ROLE_KEY }
  ];

  const errors = [];
  for (const item of required) {
    if (!item.value || item.value.includes('your_') || item.value.includes('_here')) {
      errors.push(`${item.name} is not set or contains placeholder text`);
    } else if (item.pattern && !item.pattern.test(item.value)) {
      errors.push(`${item.name} format appears invalid`);
    }
  }

  // Check optional Google Sheets configuration
  const hasGoogleSheetsKey = GOOGLE_SHEETS_PRIVATE_KEY && !GOOGLE_SHEETS_PRIVATE_KEY.includes('your_');
  const hasGoogleSheetsEmail = GOOGLE_SHEETS_CLIENT_EMAIL && !GOOGLE_SHEETS_CLIENT_EMAIL.includes('your_');
  
  if (hasGoogleSheetsKey && hasGoogleSheetsEmail) {
    console.log('✅ Google Sheets integration enabled');
  } else if (hasGoogleSheetsKey || hasGoogleSheetsEmail) {
    console.warn('⚠️ Partial Google Sheets configuration detected. Both GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_CLIENT_EMAIL are required.');
  } else {
    console.log('ℹ️ Google Sheets integration disabled (credentials not provided)');
  }

  // Check optional Supabase configuration
  const hasSupabaseUrl = SUPABASE_URL && !SUPABASE_URL.includes('your_');
  const hasSupabaseKey = SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_SERVICE_ROLE_KEY.includes('your_');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Supabase integration enabled');
  } else if (hasSupabaseUrl || hasSupabaseKey) {
    console.warn('⚠️ Partial Supabase configuration detected. Both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  } else {
    console.log('ℹ️ Supabase integration disabled (credentials not provided)');
  }

  if (errors.length) {
    console.error('Configuration Error(s):');
    errors.forEach(e => console.error(` - ${e}`));
    process.exit(1);
  }
  console.log('✅ Core configuration validation passed!');
}

// ------------------------------------------------------------
// VAPI call creation and Lead Management
// ------------------------------------------------------------
import { RIYA_SYSTEM_PROMPT, RIYA_INITIAL_GREETING, TODAYS_DATE } from './riya_system_prompt.js';
import leadManager from './lead-manager.js';

async function createVapiCall(propertyData) {
  console.log('Today\'s date for VAPI:', TODAYS_DATE);
  
  // Format and log phone number
  const formattedPhone = formatPhoneNumber(propertyData.phone_number);
  console.log(`Phone number formatting: ${propertyData.phone_number} -> ${formattedPhone}`);
  
  const callConfig = {
    assistantId: VAPI_ASSISTANT_ID,
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: {
      number: formattedPhone
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
// Helper Functions
// ------------------------------------------------------------

// Format phone number to E.164 format
function formatPhoneNumber(phoneNumber) {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 91 (India country code), add + prefix
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If it's 10 digits, assume it's Indian number without country code
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  }
  
  // If it already has + prefix, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Default: add + prefix to whatever we have
  return '+' + cleaned;
}

// Initialize Google Sheets API
function initializeGoogleSheets() {
  try {
    if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL) {
      console.warn('Google Sheets credentials not provided. Skipping Google Sheets integration.');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error.message);
    return null;
  }
}

// Store call data in Supabase
async function storeCallInSupabase(callData, propertyData) {
  if (!supabase) {
    console.log('Supabase not configured, skipping database storage');
    return;
  }

  try {
    const callRecord = {
      // Call Information
      call_id: callData.callId,
      status: callData.status,
      ended_reason: callData.endedReason,
      transcript: callData.transcript || '',
      recording_url: callData.recordingUrl || '',
      summary: callData.summary || '',
      cost: callData.cost || 0,
      duration_seconds: callData.duration ? Math.round(callData.duration / 1000) : null,
      
      // AI Analysis
      sentiment: callData.analysis?.sentiment || null,
      intent: callData.analysis?.intent || null,
      key_topics: callData.analysis?.keyTopics || null,
      
      // Property Information (if available)
      property_id: propertyData?.property_id || null,
      property_name: propertyData?.property_name || null,
      location: propertyData?.location || null,
      price_crores: propertyData?.price_crores || null,
      bedrooms: propertyData?.bedrooms || null,
      bathrooms: propertyData?.bathrooms || null,
      area_sqft: propertyData?.area_sqft || null,
      property_type: propertyData?.property_type || null,
      builder: propertyData?.builder || null,
      possession_status: propertyData?.possession_status || null,
      amenities: propertyData?.amenities || null,
      
      // Lead Information (if available)
      contact_person: propertyData?.contact_person || null,
      phone_number: propertyData?.phone_number || null,
      email: propertyData?.email || null,
      lead_status: propertyData?.lead_status || null,
      notes: propertyData?.notes || null,
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('vapi_calls')
      .insert([callRecord])
      .select();

    if (error) {
      console.error('Error storing call in Supabase:', error.message);
    } else {
      console.log('✅ Successfully stored call in Supabase:', data[0]?.id);
    }

  } catch (error) {
    console.error('Error with Supabase operation:', error.message);
  }
}

// Update Google Sheets with call results
async function updateGoogleSheets(callData, propertyData) {
  const sheets = initializeGoogleSheets();
  if (!sheets) {
    console.log('Google Sheets not configured, skipping update');
    return;
  }

  try {
    // First, get sheet metadata to find the correct sheet name
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID
    });
    
    const firstSheet = sheetMetadata.data.sheets[0];
    const sheetName = firstSheet.properties.title;
    console.log(`Using sheet name: ${sheetName}`);
    
    // Get all data from the first sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1000`, // Use dynamic sheet name with specific range
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      console.log('No data found in spreadsheet');
      return;
    }

    // Find header row (assume first row)
    const headers = rows[0];
    const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone'));
    const propertyIdIndex = headers.findIndex(h => h.toLowerCase().includes('property_id'));
    
    // Find the row to update
    let targetRowIndex = -1;
    const searchPhone = propertyData?.phone_number || callData.phoneNumber;
    const searchPropertyId = propertyData?.property_id || callData.propertyId;
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if ((phoneIndex >= 0 && row[phoneIndex] && searchPhone && row[phoneIndex].includes(searchPhone.replace(/\D/g, ''))) ||
          (propertyIdIndex >= 0 && row[propertyIdIndex] === searchPropertyId)) {
        targetRowIndex = i;
        break;
      }
    }

    if (targetRowIndex === -1) {
      console.log('No matching row found in spreadsheet');
      return;
    }

    // Prepare update data
    const updateData = [];
    const fieldsToUpdate = {
      'endedReason': callData.endedReason || '',
      'transcript': callData.transcript || '',
      'recordingUrl': callData.recordingUrl || '',
      'summary': callData.summary || '',
      'sentiment': callData.analysis?.sentiment || '',
      'intent': callData.analysis?.intent || '',
      'callStatus': callData.status || '',
      'callCost': callData.cost || '',
      'callDuration': callData.duration ? Math.round(callData.duration / 1000) + 's' : '',
      'lastUpdated': new Date().toISOString()
    };

    // Find column indices and prepare batch update
    const updates = [];
    Object.entries(fieldsToUpdate).forEach(([fieldName, value]) => {
      const columnIndex = headers.findIndex(h => 
        h.toLowerCase().replace(/[^a-z]/g, '').includes(fieldName.toLowerCase()) ||
        fieldName.toLowerCase().includes(h.toLowerCase().replace(/[^a-z]/g, ''))
      );
      
      if (columnIndex >= 0) {
        const cellAddress = `${String.fromCharCode(65 + columnIndex)}${targetRowIndex + 1}`;
        updates.push({
          range: `${sheetName}!${cellAddress}`,
          values: [[value]]
        });
      }
    });

    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
        resource: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
      
      console.log(`✅ Updated Google Sheets row ${targetRowIndex + 1} with call results`);
    } else {
      console.log('No matching columns found for update');
    }

  } catch (error) {
    console.error('Error updating Google Sheets:', error.message);
  }
}

// ------------------------------------------------------------
// Authentication Setup
// ------------------------------------------------------------
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const requestAccessSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().min(2).max(100).required(),
  company: Joi.string().max(100).optional().allow(''),
  phone: Joi.string().max(20).optional().allow(''),
  reason: Joi.string().max(500).optional().allow('')
});

// Session management
const activeSessions = new Map();

// Generate session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication middleware for API endpoints
function requireAuth(req, res, next) {
  console.log('🔐 requireAuth called for:', req.method, req.path);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No auth header found');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  
  if (!session || session.expiresAt < new Date()) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  req.user = session.user;
  next();
}

// Authentication middleware for web pages (redirects to login)
function requireWebAuth(req, res, next) {
  console.log('🌐 requireWebAuth called for:', req.method, req.path);
  // For web pages, we don't enforce server-side auth
  // Authentication is handled on the frontend via JavaScript
  next();
}

// Permission checking middleware
function requirePermission(permission) {
  return async (req, res, next) => {
    try {
      // Get user from request (set by requireAuth)
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log('🔍 Looking up permissions for user:', req.user.email);

      // Get user profile and permissions from Supabase
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role, can_manage_leads, can_start_campaigns, can_view_analytics, can_export_data')
        .eq('email', req.user.email)
        .single();

      if (error) {
        console.log('⚠️ Database error looking up user profile:', error.message);
      }

      if (!profile) {
        console.log('⚠️ No user profile found for:', req.user.email);
      } else {
        console.log('✅ User profile found:', req.user.email, 'Role:', profile.role, 'Permissions:', profile);
      }

      if (error || !profile) {
        // Special handling for admin@soraaya.ai - always grant admin permissions
        if (req.user.email === 'admin@soraaya.ai') {
          console.log('🔑 Admin user detected - granting full permissions');
          req.userPermissions = {
            role: 'admin',
            can_manage_leads: true,
            can_start_campaigns: true,
            can_view_analytics: true,
            can_export_data: true
          };
        } else {
          // For other users, grant admin permissions for testing
          console.log('🧪 Testing mode - granting admin permissions for:', req.user.email);
          req.userPermissions = {
            role: 'admin',
            can_manage_leads: true,
            can_start_campaigns: true,
            can_view_analytics: true,
            can_export_data: true
          };
        }
      } else {
        console.log('✅ Using database permissions for:', req.user.email);
        req.userPermissions = profile;
      }

      // Check specific permission
      let hasPermission = false;
      switch (permission) {
        case 'manage_leads':
          hasPermission = req.userPermissions.can_manage_leads;
          break;
        case 'start_campaigns':
          hasPermission = req.userPermissions.can_start_campaigns;
          break;
        case 'view_analytics':
          hasPermission = req.userPermissions.can_view_analytics;
          break;
        case 'export_data':
          hasPermission = req.userPermissions.can_export_data;
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission) {
        console.log(`❌ Permission denied: ${req.user.email} lacks '${permission}' permission`);
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          required: permission,
          userRole: req.userPermissions.role 
        });
      }

      console.log(`✅ Permission granted: ${req.user.email} has '${permission}' permission`);
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}



// ------------------------------------------------------------
// Express Endpoints
// ------------------------------------------------------------

// Authentication routes
app.post('/api/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get user from database
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .limit(1);

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session in database
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Store session in memory for quick access
    activeSessions.set(sessionToken, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      expiresAt
    });

    res.json({
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/request-access', async (req, res) => {
  try {
    const { error } = requestAccessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, fullName, company, phone, reason } = req.body;

    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Check if request already exists
    const { data: existingRequests, error: checkError } = await supabase
      .from('access_requests')
      .select('id, status')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Database error:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingRequests && existingRequests.length > 0) {
      const existingRequest = existingRequests[0];
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ error: 'Access request already pending for this email' });
      } else if (existingRequest.status === 'approved') {
        return res.status(400).json({ error: 'Access already granted for this email' });
      }
    }

    // Create new access request
    const { data, error: insertError } = await supabase
      .from('access_requests')
      .insert({
        email,
        full_name: fullName,
        company: company || null,
        phone: phone || null,
        reason: reason || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to submit request' });
    }

    console.log(`📧 New access request from ${fullName} (${email})`);
    
    res.json({ 
      message: 'Access request submitted successfully',
      requestId: data.id
    });
  } catch (error) {
    console.error('Request access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Session verification
app.get('/api/verify-session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No session token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // Check memory first
    const session = activeSessions.get(token);
    if (session && session.expiresAt > new Date()) {
      return res.json({ user: session.user });
    }
    
    // Check database if not in memory
    if (supabase) {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select(`
          id,
          expires_at,
          users (
            id,
            email,
            full_name,
            role,
            status
          )
        `)
        .eq('session_token', token)
        .eq('users.status', 'active')
        .limit(1);
        
      if (error || !sessions || sessions.length === 0) {
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      const sessionData = sessions[0];
      const expiresAt = new Date(sessionData.expires_at);
      
      if (expiresAt <= new Date()) {
        // Clean up expired session
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', token);
        return res.status(401).json({ error: 'Session expired' });
      }
      
      // Update memory cache
      const user = {
        id: sessionData.users.id,
        email: sessionData.users.email,
        fullName: sessionData.users.full_name,
        role: sessionData.users.role
      };
      
      activeSessions.set(token, { user, expiresAt });
      return res.json({ user });
    }
    
    res.status(401).json({ error: 'Invalid session' });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Remove from memory
      activeSessions.delete(token);
      
      // Remove from database
      if (supabase) {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', token);
      }
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login page
// Root endpoint - serve landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing-new.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected dashboard route
app.get('/dashboard', requireWebAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard-new.html'));
});

// ------------------------------------------------------------
// Lead Management API Endpoints
// ------------------------------------------------------------

// Get leads for calling
app.get('/api/leads', requireAuth, requirePermission('view_analytics'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const leads = await leadManager.getLeadsForCalling(limit);
    res.json({ success: true, leads, count: leads.length });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start automated calling process
app.post('/api/start-calling', requireAuth, requirePermission('start_campaigns'), async (req, res) => {
  try {
    const { leadLimit = 20 } = req.body;
    console.log(`🚀 Starting automated calling for ${leadLimit} leads`);
    
    const result = await leadManager.startAutomatedCalling(leadLimit);
    
    if (result.error) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      message: 'Automated calling started',
      ...result
    });
  } catch (error) {
    console.error('Error starting automated calling:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active call statistics
app.get('/api/call-stats', requireAuth, (req, res) => {
  try {
    const stats = leadManager.getActiveCallStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting call stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user permissions
app.get('/api/user-permissions', requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, can_manage_leads, can_start_campaigns, can_view_analytics, can_export_data')
      .eq('email', req.user.email)
      .single();

    if (error || !profile) {
      // Default to admin for testing if no profile found
      const defaultPermissions = {
        role: 'admin',
        can_manage_leads: true,
        can_start_campaigns: true,
        can_view_analytics: true,
        can_export_data: true
      };
      return res.json({ success: true, permissions: defaultPermissions });
    }

    res.json({ success: true, permissions: profile });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update test data (for testing purposes only)
app.post('/api/update-test-data', requireAuth, requirePermission('manage_leads'), async (req, res) => {
  try {
    const testPhoneNumber = '+918884154540';
    
    console.log('🧪 Setting up test data...');
    
    // Update all leads with test phone number
    const { error: phoneUpdateError } = await supabase
      .from('leads')
      .update({ phone_number: testPhoneNumber })
      .neq('phone_number', null);
    
    if (phoneUpdateError) {
      throw new Error('Failed to update phone numbers: ' + phoneUpdateError.message);
    }
    
    // Set all leads to 'not_interested' first
    const { error: statusUpdateError } = await supabase
      .from('leads')
      .update({ 
        status: 'not_interested',
        last_call_result: 'Set for testing - not interested',
        updated_at: new Date().toISOString()
      })
      .neq('status', null);
    
    if (statusUpdateError) {
      throw new Error('Failed to update statuses: ' + statusUpdateError.message);
    }
    
    // Get the first lead to set as 'to_call'
    const { data: firstLead, error: firstLeadError } = await supabase
      .from('leads')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (firstLeadError || !firstLead) {
      throw new Error('Failed to get first lead: ' + (firstLeadError?.message || 'No leads found'));
    }
    
    // Set first lead to 'to_call' status
    const { error: firstLeadUpdateError } = await supabase
      .from('leads')
      .update({
        status: 'to_call',
        follow_up_count: 0,
        last_call_result: null,
        callback_scheduled_at: null,
        last_contacted: null,
        call_completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', firstLead.id);
    
    if (firstLeadUpdateError) {
      throw new Error('Failed to update first lead: ' + firstLeadUpdateError.message);
    }
    
    // Get updated counts
    const { data: statusCounts, error: countError } = await supabase
      .from('leads')
      .select('status')
      .then(result => {
        if (result.error) return { data: null, error: result.error };
        const counts = {};
        result.data.forEach(lead => {
          counts[lead.status] = (counts[lead.status] || 0) + 1;
        });
        return { data: counts, error: null };
      });
    
    console.log('✅ Test data updated successfully');
    
    res.json({
      success: true,
      message: 'Test data updated successfully',
      testPhoneNumber: testPhoneNumber,
      statusCounts: statusCounts || {},
      firstLeadId: firstLead.id
    });
    
  } catch (error) {
    console.error('Error updating test data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update lead status manually
app.put('/api/leads/:leadId/status', requireAuth, requirePermission('manage_leads'), async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, notes } = req.body;
    
    const success = await leadManager.updateLeadStatus(leadId, status, null, {
      notes: notes || undefined,
      manual_update: true,
      updated_by: req.user?.id
    });
    
    if (success) {
      res.json({ success: true, message: 'Lead status updated' });
    } else {
      res.status(400).json({ error: 'Failed to update lead status' });
    }
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------
// Additional routes
// ------------------------------------------------------------

// Debug endpoint to check Google Sheets structure
app.get('/debug-sheet', async (req, res) => {
  const sheets = initializeGoogleSheets();
  if (!sheets) {
    return res.json({ error: 'Google Sheets not configured' });
  }

  try {
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID
    });
    
    const firstSheet = sheetMetadata.data.sheets[0];
    const sheetName = firstSheet.properties.title;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: `${sheetName}!A1:Z10`, // Get first 10 rows
    });

    const rows = response.data.values || [];
    const headers = rows[0] || [];
    
    res.json({
      sheetName,
      headers,
      sampleRows: rows.slice(1, 6), // First 5 data rows
      totalRows: rows.length
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Debug endpoint to check stored property data
app.get('/debug-calls', (req, res) => {
  const storedCalls = {};
  for (const [callId, data] of callPropertyData.entries()) {
    storedCalls[callId] = {
      property_id: data.property_id,
      property_name: data.property_name,
      contact_person: data.contact_person,
      phone_number: data.phone_number
    };
  }
  
  res.json({
    totalStoredCalls: callPropertyData.size,
    storedCalls
  });
});

// Debug endpoint to check recent Supabase entries
app.get('/debug-supabase', async (req, res) => {
  if (!supabase) {
    return res.json({ error: 'Supabase not configured' });
  }

  try {
    const { data, error } = await supabase
      .from('vapi_calls')
      .select('id, call_id, status, ended_reason, transcript, summary, sentiment, lead_status, property_name, contact_person, phone_number, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return res.json({ error: error.message });
    }

    res.json({
      totalEntries: data.length,
      recentCalls: data
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Handle POST requests to root (common mistake)
app.post('/', (req, res) => {
  res.status(400).json({ 
    error: 'Invalid endpoint. Use POST /trigger-call to initiate calls.',
    correctEndpoint: '/trigger-call',
    receivedData: req.body
  });
});

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
    const callResult = await triggerVapiCall(req.body);
    
    // Store property data for later use when call ends
    if (callResult && callResult.id) {
      callPropertyData.set(callResult.id, req.body);
      console.log(`Stored property data for call ${callResult.id}`);
    }
    
    console.log('Call triggered successfully:', callResult);
    res.json({ success: true, callId: callResult.id, message: 'Call initiated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/post-call-results', async (req, res) => {
  console.log('--- /post-call-results endpoint HIT ---');
  console.log('Raw webhook payload:', JSON.stringify(req.body, null, 2));
  
  const { error } = resultsSchema.validate(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    // Use lead manager to handle call completion
    const success = await leadManager.handleCallCompletion(req.body);
    
    if (success) {
      console.log('✅ Call completion processed successfully');
      res.json({ status: 'received', success: true });
    } else {
      console.log('⚠️ Call completion processing failed');
      res.status(400).json({ status: 'error', message: 'Failed to process call completion' });
    }
  } catch (error) {
    console.error('❌ Error processing call completion:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  validateConfiguration();
  console.log(`🚀 Server listening on port ${PORT}`);
});
