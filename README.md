# 🤖 AI Lead Qualification Platform

A complete multi-user AI-powered lead qualification system with automated outbound calling, real-time analytics, and separate admin/client interfaces.

## 🏗️ **Architecture Overview**

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Client Dashboard  │    │  Admin Control Panel│    │   Backend API       │
│   (Port 3002)       │    │   (Port 3001)       │    │   (Port 3000)       │
│                     │    │                     │    │                     │
│ 📊 Clean UI         │    │ 🎛️ Full Control     │    │ 🔌 VAPI Integration │
│ 📈 Results Only     │    │ 🚀 Campaign Mgmt    │    │ 🗄️ Database         │
│ 🔐 Client Focused   │    │ 👥 User Management   │    │ 📞 Call Management  │
└─────────────────────┘    │ 📊 System Stats     │    │ 🔐 Authentication   │
           │                │ 📝 Logs & Monitoring│    │ 📊 Analytics        │
           │                │ ⚡ Quick Actions     │    │ 🎯 Business Logic   │
           └────────────────┴─────────────────────┘    └─────────────────────┘
                         │                                       │
                         └───────────────────────────────────────┘
                                    API Calls
```

## 🎯 **What This Platform Does**

### **For End Users (Clients):**
- 📊 **Clean Dashboard** - View lead qualification results and metrics

### Key Capabilities
- **Smart Lead Qualification**: AI assistant qualifies leads automatically
- **Campaign Management**: Start/stop calling campaigns with custom settings
- **Real-time Analytics**: Live call metrics and success rates
- **Export Tools**: Download qualified leads and reports
- **Permission System**: Admin and user roles with appropriate access

## Project Structure

```
├── backend/                 # API Server
│   ├── index.js            # Main server with all endpoints
│   ├── lead-manager.js     # Automated calling system
│   ├── riya_system_prompt.js # AI assistant configuration
│   └── package.json        # Dependencies
├── client/                 # Frontend Application
│   ├── public/
│   │   ├── landing-new.html # Landing page
│   │   ├── login.html      # Authentication
│   │   └── dashboard-new.html # Main dashboard
│   ├── server.js           # Static file server
│   └── package.json        # Dependencies
├── data/                   # Database Schema
│   ├── supabase-schema.sql # Core database setup
│   ├── user-schema.sql     # User management
│   ├── leads-schema.sql    # Lead management
│   ├── user-permissions-schema.sql # Role-based permissions
│   ├── mumbai_luxury_properties.csv # Sample data
│   └── dummy_vapi_calls_corrected.csv # Sample calls
└── .env                    # Environment configuration
```

## Quick Setup

### Prerequisites
- Node.js 18+
- Supabase account
- VAPI account

### 1. Environment Setup
Create `.env` in project root:

```env
# VAPI Configuration
VAPI_API_KEY=your_vapi_api_key
VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PHONE_NUMBER_ID=your_phone_number_id

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional Integrations
GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email

# Server
PORT=3000
```

### 2. Database Setup
```bash
# Execute schema files in order
psql $DATABASE_URL -f data/supabase-schema.sql
psql $DATABASE_URL -f data/user-schema.sql
psql $DATABASE_URL -f data/leads-schema.sql
psql $DATABASE_URL -f data/user-permissions-schema.sql
```

### 3. Start Backend
```bash
cd backend
npm install
node index.js
# Server runs on http://localhost:3000
```

### 4. Start Client
```bash
cd client
npm install
node server.js
# Client runs on http://localhost:3001
```

### 5. Access Application
- **Dashboard**: http://localhost:3001
- **API Health**: http://localhost:3000/health

## Authentication

### Default Admin Account
```
Email: admin@soraaya.ai
Password: admin123
```

### User Roles
- **Admin**: Full platform access, user management, campaign controls
- **User**: Dashboard access, limited permissions

## Core API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User authentication
- `GET /api/verify-session` - Session validation
- `POST /api/logout` - User logout

### Lead Management
- `GET /api/leads` - Fetch leads for calling
- `POST /api/start-calling` - Start automated campaigns
- `GET /api/call-stats` - Real-time statistics
- `PUT /api/leads/:id/status` - Update lead status

### User Management
- `GET /api/user-permissions` - Get user permissions
- `GET /api/users` - List users (admin only)

### Webhooks
- `POST /trigger-call` - Manual call trigger
- `POST /post-call-results` - VAPI completion webhook

## AI Assistant (Riya)

Configured for luxury real estate with:
- Property expertise and market knowledge
- Lead qualification criteria
- Natural conversation flow
- Automatic status classification

### Lead Status Flow
```
to_call → calling → [qualified|not_interested|follow_up|callback_requested]
```

## Deployment Ready

### Backend Deployment
- Railway, Heroku, or any Node.js hosting
- Set environment variables
- Configure webhook URLs

### Client Deployment
- Netlify, Vercel, or static hosting
- Update API endpoints for production
- Configure domain settings

### Database
- Supabase (managed PostgreSQL)
- Enable RLS policies
- Configure authentication

## Current State

✅ **Completed Features:**
- Clean, simplified architecture (backend + client)
- Full authentication system
- Lead management and calling automation
- Real-time dashboard with metrics
- Role-based permissions
- Export functionality
- VAPI integration
- Database schema and sample data

✅ **Code Quality:**
- Removed all debug logs and test code
- Clean, maintainable codebase
- Proper error handling
- Responsive UI design
- Production-ready configuration

## Configuration Notes

- All sensitive data in environment variables
- CORS configured for development
- Authentication via Supabase Auth
- Real-time updates via API polling
- Mobile-responsive design

---

**Ready for production deployment** 🚀
