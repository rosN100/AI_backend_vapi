import express from 'express';
import dotenv from 'dotenv';
import twilio from 'twilio';
import https from 'https';
import Joi from 'joi';
import fetch from 'node-fetch';

dotenv.config();

const {
  PORT = 3000,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  ULTRAVOX_API_KEY,
  N8N_RESULTS_URL
} = process.env;

// const SYSTEM_PROMPT = 'Your name is Steve and you are calling a person on the phone. Ask them their name and see how they are doing.';

const app = express();
app.use(express.json());

// ------------------------------------------------------------
// Validation schemas
// ------------------------------------------------------------
const callSchema = Joi.object({
  candidateId: Joi.string().required(),
  candidateName: Joi.string().required(),
  candidatePhone: Joi.string().required(),
  candidateGender: Joi.string().required(),
  voice: Joi.string().required()
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
    { name: 'TWILIO_ACCOUNT_SID', value: TWILIO_ACCOUNT_SID, pattern: /^AC[a-zA-Z0-9]{32}$/ },
    { name: 'TWILIO_AUTH_TOKEN', value: TWILIO_AUTH_TOKEN, pattern: /^[a-zA-Z0-9]{32}$/ },
    { name: 'TWILIO_PHONE_NUMBER', value: TWILIO_PHONE_NUMBER, pattern: /^\+[1-9]\d{1,14}$/ },
    { name: 'ULTRAVOX_API_KEY', value: ULTRAVOX_API_KEY, pattern: /^[a-zA-Z0-9]{8}\.[a-zA-Z0-9]{32}$/ },
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
// Ultravox call creation
// ------------------------------------------------------------
import { getUltravoxAgentConfig } from './ultravox_agent_config.js';

function createUltravoxCall(voice, candidateName) {
  const agentConfig = getUltravoxAgentConfig(candidateName);
  const callConfig = {
    medium: { twilio: {} },
    agent: agentConfig
  };

  const request = https.request('https://api.ultravox.ai/api/calls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ULTRAVOX_API_KEY
    }
  });

  return new Promise((resolve, reject) => {
    let data = '';
    request.on('response', response => {
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Ultravox API error (${response.statusCode}): ${data}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse Ultravox response: ${data}`));
        }
      });
    });
    request.on('error', err => reject(err));
    request.write(JSON.stringify(callConfig));
    request.end();
  });
}

async function triggerUltraVoxCall(data) {
  console.log('📞 Creating Ultravox call...');
  const uv = await createUltravoxCall(data.voice, data.candidateName);
  console.log('✅ Got Ultravox joinUrl:', uv.joinUrl);

  console.log('📱 Initiating Twilio call...');
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const call = await client.calls.create({
    twiml: `<Response><Connect><Stream url="${uv.joinUrl}"/></Connect></Response>`,
    to: data.candidatePhone,
    from: TWILIO_PHONE_NUMBER
  });

  console.log('🎉 Twilio outbound phone call initiated!');
  console.log(`📋 Twilio Call SID: ${call.sid}`);
  return { joinUrl: uv.joinUrl, callSid: call.sid };
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
    const callInfo = await triggerUltraVoxCall(req.body);
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
