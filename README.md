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

