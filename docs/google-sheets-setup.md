# Google Sheets Integration Setup Guide

## Step 1: Create a Google Cloud Service Account

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Enter a name (e.g., "vapi-sheets-integration")
   - Click "Create and Continue"

4. **Download Service Account Key**
   - After creating, click on the service account email
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the file

## Step 2: Extract Credentials from JSON

From the downloaded JSON file, you need these two values:

```json
{
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com"
}
```

## Step 3: Share Your Google Sheet

1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/1VJoRrxpzeNYEp8IVgMglj79Abc04OZ9Al1nUPi3mK2w/edit
2. **Click "Share" button**
3. **Add the service account email** (from step 2) as an Editor
4. **Make sure the sheet has these column headers** (case-insensitive):
   - `phone_number` or `phone`
   - `property_id`
   - `endedReason`
   - `transcript`
   - `recordingUrl`
   - `summary`
   - `sentiment`
   - `intent`
   - `callStatus`
   - `callCost`
   - `callDuration`
   - `lastUpdated`

## Step 4: Set Environment Variables

Add these to your `.env` file:

```env
# Google Sheets Integration (Optional)
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="1VJoRrxpzeNYEp8IVgMglj79Abc04OZ9Al1nUPi3mK2w"
```

**Important Notes:**
- Keep the `\n` characters in the private key exactly as shown
- The spreadsheet ID is already set to your sheet
- If these credentials are not provided, the system will skip Google Sheets updates

## Step 5: Test the Integration

1. **Install dependencies**: `npm install`
2. **Start the server**: `npm start`
3. **Make a test call** using your n8n workflow
4. **Check the console logs** for Google Sheets update confirmations
5. **Verify the sheet** has been updated with call results

## Troubleshooting

### Common Issues:

1. **"Failed to initialize Google Sheets"**
   - Check that the private key format is correct (with `\n` characters)
   - Verify the client email is correct

2. **"No matching row found in spreadsheet"**
   - Ensure the phone number or property_id matches between the call data and sheet
   - Check that the sheet has the correct column headers

3. **"Permission denied"**
   - Make sure you shared the sheet with the service account email
   - Verify the service account has Editor permissions

4. **"No matching columns found for update"**
   - Check that your sheet has the required column headers
   - Column matching is case-insensitive and flexible

### Success Indicators:

- Console shows: `✅ Google Sheets integration enabled`
- After calls: `✅ Updated Google Sheets row X with call results`
- Your sheet gets updated with call data automatically

## Security Notes

- Never commit the `.env` file to version control
- Keep your service account credentials secure
- Consider using environment-specific service accounts for production
