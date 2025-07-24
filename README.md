# Soraaya AI Lead Qualification Dashboard with VAPI Integration

A comprehensive lead management and qualification system powered by AI voice calls through VAPI integration. This system now includes automated lead calling, real-time call management, and integrated backend processing that eliminates the need for external N8N workflows.

## Features

### Core Features
- **AI-Powered Lead Qualification**: Intelligent conversation analysis and lead scoring
- **Real-time Dashboard**: Comprehensive analytics and lead management interface
- **Secure Authentication**: User management with session-based authentication
- **Responsive Design**: Modern, mobile-friendly interface optimized for luxury real estate
- **Integration Ready**: Seamless integration with VAPI, Supabase, and Google Sheets

### New Lead Management System
- **🚀 Automated Lead Calling**: Batch process leads with configurable concurrency limits
- **📞 Real-time Call Management**: Monitor active calls, queue status, and completion rates
- **🎯 Intelligent Lead Routing**: Automatically prioritize and route leads based on status
- **🔄 Retry Logic**: Automatic retry for failed calls with exponential backoff
- **📊 Live Statistics**: Real-time updates on call progress and completion
- **⚡ Concurrency Control**: Maximum 4 simultaneous calls to prevent API rate limiting
- **🔗 Direct VAPI Integration**: No external N8N workflow required
- **📈 Advanced Analytics**: Detailed call metrics and lead qualification tracking

## Project Structure

```
├── public/                 # Frontend HTML files
│   ├── landing-new.html   # Landing page
│   ├── login.html         # Authentication page
│   └── dashboard-new.html # Main dashboard
├── static/                # Static assets (CSS, JS, images)
├── data/                  # Database schemas and sample data
│   ├── supabase-schema.sql
│   ├── user-schema.sql
│   ├── leads-schema.sql   # NEW: Lead management schema
│   ├── user-permissions-schema.sql # NEW: User permissions system
│   └── *.csv files
├── docs/                  # Documentation
├── index.js              # Main server file
├── lead-manager.js       # NEW: Lead management system
├── riya_system_prompt.js # AI prompt configuration
└── package.json          # Dependencies
```

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure your API keys and database credentials

3. **Database Setup**
   - Import schemas from `data/` folder to your Supabase instance
   - Configure authentication tables

4. **Start Server**
   ```bash
   node index.js
   ```

5. **Access Application**
   - Landing Page: `http://localhost:3000`
   - Login: `http://localhost:3000/login`
   - Dashboard: `http://localhost:3000/dashboard`

## Configuration

### Required Environment Variables

```env
PORT=3000
VAPI_API_KEY=your_vapi_key
VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PHONE_NUMBER_ID=your_phone_id
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GOOGLE_SHEETS_PRIVATE_KEY=your_sheets_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/verify-session` - Session verification

### Lead Management (Legacy)
- `POST /trigger-call` - Initiate VAPI call
- `POST /post-call-results` - Receive call results webhook
- `GET /debug-supabase` - Debug database connection

### New Lead Management API
- `GET /api/leads` - Get leads for calling (with pagination) *[requires: view_analytics]*
- `POST /api/start-calling` - Start automated calling campaign *[requires: start_campaigns]*
- `GET /api/call-stats` - Get real-time call statistics
- `GET /api/user-permissions` - Get current user's permissions
- `PUT /api/leads/:leadId/status` - Update lead status manually *[requires: manage_leads]*

### Pages
- `GET /` - Landing page
- `GET /login` - Login page
- `GET /dashboard` - Main dashboard (protected)

## Usage Guide

### Setting Up Leads

1. **Database Setup**: First, run the leads schema to create the leads table:
   ```sql
   -- Run the SQL from data/leads-schema.sql in your Supabase database
   ```

2. **Sample Data**: The schema includes sample luxury real estate leads to get started

### Using the Lead Management System

#### Dashboard Overview
- **Metrics Cards**: View total calls, answer rates, qualified leads, and interventions
- **Control Panel**: Start automated calling campaigns and monitor progress
- **Real-time Stats**: Active calls, queued calls, and daily completion counts

#### Starting a Calling Campaign

1. **Access Dashboard**: Navigate to the main dashboard after login
2. **Lead Management Panel**: Find the "📞 Lead Calling Management" section
3. **Configure Campaign**:
   - Set number of leads to call (1-50)
   - Click "🚀 Start Calling Campaign"
4. **Monitor Progress**: Watch real-time updates of active and completed calls

#### API Usage Examples

**Start Automated Calling**:
```javascript
fetch('/api/start-calling', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ leadLimit: 10 })
})
```

**Get Call Statistics**:
```javascript
fetch('/api/call-stats')
  .then(response => response.json())
  .then(data => console.log(data.stats))
```

**Update Lead Status**:
```javascript
fetch('/api/leads/123/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    status: 'qualified', 
    notes: 'Interested in luxury properties' 
  })
})
```

### Key Features Explained

#### Concurrency Control
- Maximum 4 simultaneous calls to prevent VAPI rate limiting
- Automatic queuing system for additional leads
- Smart retry logic for failed calls

#### Lead Status Management

**📞 Active/Processing Statuses:**
- **to_call**: Fresh lead, ready for calling (default status)
- **calling**: Currently being processed (part of active batch)
- **in_call**: Active call in progress with VAPI

**🔄 Follow-up Statuses:**
- **follow_up**: Lead couldn't be reached (allows up to 3 attempts)
- **callback_requested**: Lead specifically requested callback

**✅ Final Resolution Statuses:**
- **qualified**: Successfully qualified lead (FINAL)
- **not_interested**: Lead declined/not interested (FINAL)
- **unresponsive**: No response after 3 follow-up attempts (FINAL)

**⚠️ Human Intervention Statuses:**
- **human_follow_up**: Requires manual follow-up action
- **human_input_needed**: Requires human review/intervention

**🔧 Technical Status:**
- **call_failed**: Technical call failure (will be retried)

**📊 Campaign Flow:**
```
[to_call/follow_up/callback_requested/call_failed] 
                ↓
        (user starts campaign)
                ↓
            calling (batch processing)
                ↓
            in_call (active VAPI call)
                ↓
    [qualified/not_interested/follow_up/unresponsive/etc.]
```

#### User Permission System

**Admin Users** have access to:
- ✅ Dashboard analytics and metrics
- ✅ Lead management and status updates
- ✅ Start automated calling campaigns
- ✅ Export lead data
- ✅ View all system features

**General Users** have access to:
- ✅ Dashboard analytics and metrics
- ✅ Export lead data
- ❌ Lead management (view only)
- ❌ Cannot start calling campaigns
- ❌ Cannot modify lead statuses

**Setting Up Permissions:**
```sql
-- Run this to promote a user to admin
SELECT public.promote_user_to_admin('user@example.com');

-- Or manually update user_profiles table
UPDATE user_profiles 
SET role = 'admin', can_manage_leads = true, can_start_campaigns = true 
WHERE email = 'user@example.com';
```

#### Webhook Processing
- Automatic call completion handling
- Lead status updates based on call results
- Transcript and summary storage
- Qualification scoring integration

## Production Deployment

1. **Environment Setup**
   - Ensure all environment variables are configured
   - Use production database credentials
   - Enable HTTPS

2. **Security**
   - Update CORS settings for production domain
   - Configure proper session management
   - Enable rate limiting

3. **Monitoring**
   - Set up logging and error tracking
   - Configure health checks
   - Monitor API usage

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Session-based with Supabase
- **AI Integration**: VAPI for voice calls
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Data Storage**: Google Sheets integration

## Support

For technical support or questions, please refer to the documentation in the `docs/` folder or contact the development team.
