# Ultravox Twilio Outbound Call API

This project exposes a simple Express server that integrates Ultravox AI with Twilio to place outbound phone calls. It is designed to work with an n8n workflow and provides two REST endpoints.

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
2. Copy `.env.example` to `.env` and fill in your credentials.
3. Start the server:
   ```bash
   npm start
   ```

The server validates incoming payloads using **Joi** and reuses the existing Ultravox call logic.

## Environment Variables

See `.env.example` for all required variables:

- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` – Twilio credentials
- `TWILIO_PHONE_NUMBER` – Twilio phone number used to place calls
- `ULTRAVOX_API_KEY` – Ultravox API key
- `N8N_RESULTS_URL` – n8n webhook to receive post‑call results

## Usage

Send a POST request to `/trigger-call` with a JSON body:

```json
{
  "candidateId": "string",
  "candidateName": "string",
  "candidatePhone": "string",
  "candidateGender": "string",
  "voice": "string"
}
```

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

