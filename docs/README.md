# VAPI Outbound Call API

This project exposes a simple Express server that integrates with VAPI to place outbound phone calls. It is designed to work with an n8n workflow and provides two REST endpoints.

## Endpoints

| Method | Endpoint          | Description                                               |
| ------ | ----------------- | --------------------------------------------------------- |
| POST   | `/trigger-call`   | Receive candidate data from n8n and initiate the call.    |
| POST   | `/post-call-results` | Receive call results and forward them to the n8n workflow. |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file and add your VAPI credentials.
3. Start the server:
   ```bash
   npm start
   ```

The server validates incoming payloads using **Joi** and uses VAPI for voice call management.

## Environment Variables

Required environment variables:

- `VAPI_API_KEY` – VAPI API key for authentication
- `VAPI_ASSISTANT_ID` – VAPI Assistant ID to use for calls
- `VAPI_PHONE_NUMBER_ID` – VAPI Phone Number ID for outbound calls
- `N8N_RESULTS_URL` – n8n webhook to receive post‑call results

# Google Sheets Integration (Optional)
- `GOOGLE_SHEETS_PRIVATE_KEY` – Google Sheets private key
- `GOOGLE_SHEETS_CLIENT_EMAIL` – Google Sheets client email
- `GOOGLE_SHEETS_SPREADSHEET_ID` – Google Sheets spreadsheet ID

# Supabase Integration (Optional)
- `SUPABASE_URL` – Supabase project URL
- `SUPABASE_ANON_KEY` – Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` – Supabase service role key

## Usage

Send a POST request to `/trigger-call` with property data from your CRM:

**⚠️ IMPORTANT: Make sure your URL ends with `/trigger-call`**
- ✅ Correct: `https://your-domain.com/trigger-call`
- ❌ Wrong: `https://your-domain.com/` (will cause 404 error)

```json
{
  "property_id": "LP001",
  "property_name": "Oberoi Sky City",
  "location": "Borivali East",
  "area_sqft": 1850,
  "bedrooms": 3,
  "bathrooms": 3,
  "price_crores": 4.2,
  "price_per_sqft": 22703,
  "property_type": "Apartment",
  "builder": "Oberoi Realty",
  "possession_status": "Ready to Move",
  "amenities": "Swimming Pool, Gym, Club House, Security",
  "contact_person": "Rajesh Sharma",
  "phone_number": "918884154540",
  "email": "rajesh.sharma@email.com",
  "lead_status": "Hot Lead",
  "last_contacted": "2025-01-15",
  "notes": "Interested in 3BHK"
}
```

## Troubleshooting

### Common Error: "Cannot POST /"
If you get a 404 error with "Cannot POST /", check your n8n HTTP Request node:
1. Make sure the URL ends with `/trigger-call`
2. Set Content-Type header to `application/json`
3. Enable "Send Body" and set to JSON format

### Phone Number Format Error
If you get "customer.number must be a valid phone number in the E.164 format":
- The server automatically formats Indian phone numbers
- Supported formats:
  - `"918884154540"` → `"+918884154540"` ✅
  - `"8884154540"` → `"+918884154540"` ✅  
  - `"+918884154540"` → `"+918884154540"` ✅
  - `"91-888-415-4540"` → `"+918884154540"` ✅

### Testing the API
You can test if the server is running by visiting the root URL in your browser:
- `https://your-domain.com/` - Should show server status

## VAPI Webhook Response Schema

After a call ends, VAPI sends a webhook to your `/post-call-results` endpoint with the following structure:

```json
{
  "message": {
    "type": "call-ended",
    "call": {
      "id": "call_abc123def456",
      "orgId": "org_xyz789",
      "createdAt": "2025-01-15T10:30:45.123Z",
      "updatedAt": "2025-01-15T10:35:12.456Z",
      "type": "outboundPhoneCall",
      "status": "ended",
      "phoneNumberId": "phone_123",
      "customerId": null,
      "assistantId": "asst_456",
      "endedReason": "customer-ended-call",
      "cost": 0.25,
      "transcript": "Hello, I'm calling about the property...",
      "recordingUrl": "https://storage.vapi.ai/recordings/call_abc123.mp3",
      "summary": "Customer showed interest in 3BHK apartment",
      "analysis": {
        "sentiment": "positive",
        "intent": "interested",
        "keyTopics": ["budget", "location", "amenities"]
      }
    }
  }
}
```

### Key Fields You'll Receive:

- **`call.id`** - Unique call identifier
- **`call.status`** - Call status ("ended", "failed", etc.)
- **`call.endedReason`** - Why the call ended ("customer-ended-call", "assistant-ended-call", etc.)
- **`call.transcript`** - Full conversation transcript
- **`call.recordingUrl`** - URL to download call recording (if enabled)
- **`call.summary`** - AI-generated call summary
- **`call.cost`** - Cost of the call in USD
- **`call.analysis`** - AI analysis of the conversation (sentiment, intent, etc.)
- **`call.createdAt/updatedAt`** - Timestamps for call duration calculation

### Processed Data Sent to n8n:

The server processes the VAPI webhook and sends this cleaned data to your n8n workflow:

```json
{
  "callId": "call_abc123def456",
  "status": "ended",
  "endedReason": "customer-ended-call",
  "transcript": "Hello, I'm calling about the property...",
  "recordingUrl": "https://storage.vapi.ai/recordings/call_abc123.mp3",
  "summary": "Customer showed interest in 3BHK apartment",
  "cost": 0.25,
  "duration": 267000,
  "analysis": {
    "sentiment": "positive",
    "intent": "interested",
    "keyTopics": ["budget", "location", "amenities"]
  }
}
```

## How Property Context is Passed to VAPI

## Google Sheets Integration

The system automatically updates your Google Sheet with call results after each call ends. The following fields are updated:

- **endedReason** - Why the call ended (customer-ended-call, etc.)
- **transcript** - Full conversation transcript
- **recordingUrl** - Link to call recording
- **summary** - AI-generated call summary
- **sentiment** - Conversation sentiment (positive, negative, neutral)
- **intent** - Customer intent (interested, not-interested, etc.)
- **callStatus** - Call status (ended, failed, etc.)
- **callCost** - Cost of the call in USD
- **callDuration** - Call duration in seconds
- **lastUpdated** - Timestamp of last update

### Setup Instructions

📋 **See [google-sheets-setup.md](./google-sheets-setup.md) for complete setup instructions**

### Quick Setup:
1. Create a Google Cloud service account
2. Enable Google Sheets API
3. Share your sheet with the service account email
4. Add credentials to your `.env` file

**Your Google Sheet**: https://docs.google.com/spreadsheets/d/1VJoRrxpzeNYEp8IVgMglj79Abc04OZ9Al1nUPi3mK2w/edit

## Supabase Integration (Recommended for Production)

For production use, the system can store call data in a Supabase PostgreSQL database alongside Google Sheets.

### Benefits of Supabase:
- **Better Performance**: Direct database queries vs API rate limits
- **Rich Data Types**: Proper data types instead of text-only
- **Advanced Querying**: Full SQL support for analytics
- **Real-time Updates**: Live data subscriptions
- **Scalability**: Handle thousands of calls efficiently

### Setup Instructions:

1. **Get your Supabase credentials** from your project dashboard:
   - Go to Settings → API
   - Copy Project URL, Anon Key, and Service Role Key

2. **Create the database table**:
   - Go to SQL Editor in Supabase
   - Run the SQL from `supabase-schema.sql`

3. **Add to your `.env` file**:
   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

### Data Storage Strategy:

- **Supabase**: Primary database for structured data and analytics
- **Google Sheets**: Backup/manual view for non-technical team members
- **Both systems updated automatically** after each call

### Database Schema:

The `vapi_calls` table stores:
- Call metadata (ID, status, duration, cost)
- AI analysis (transcript, summary, sentiment, intent)
- Property information (name, location, price, amenities)
- Lead information (contact details, status, notes)
- Timestamps for tracking

## How Property Context is Passed to VAPI

The system uses VAPI's **dynamic variables** feature to pass property data as context to the AI assistant:

1. **Variable Values**: All property data is passed via `assistantOverrides.variableValues`
2. **System Prompt**: The assistant's system prompt uses variables like `{{property_name}}`, `{{contact_person}}`, etc.
3. **First Message**: Dynamically generated greeting with property-specific information
4. **Real-time Context**: The assistant has access to all property details during the conversation

### Available Variables in Assistant:
- `{{contact_person}}` - Lead's name
- `{{property_name}}` - Property name
- `{{location}}` - Property location
- `{{price_crores}}` - Property price
- `{{bedrooms}}`, `{{bathrooms}}` - Property specs
- `{{amenities}}` - Property amenities
- `{{lead_status}}` - Current lead status
- `{{notes}}` - Previous interaction notes

After the call completes, post the results to `/post-call-results`:

```json
{
  "candidateId": "string",
  "callStatus": "string",
  "candidateResponse": "string",
  "scheduledTime": "string",
  "followUpRequired": true,
  "callRecordingUrl": "string",
  "transcript": "string"
}
```

The server will forward these results to the `N8N_RESULTS_URL`.

