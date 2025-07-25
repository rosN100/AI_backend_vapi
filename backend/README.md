# 🔌 Backend API Server

The core backend API that powers both the admin panel and client dashboard for the AI Lead Qualification Platform.

## 🎯 **What This Service Does**

- **🗄️ Database Management** - Supabase PostgreSQL with multi-user support
- **📞 VAPI Integration** - Automated outbound calling and webhook handling
- **🔐 Authentication** - User management and permissions
- **📊 Analytics** - Lead stats, call records, and reporting
- **🎛️ Campaign Control** - Batch calling and lead management
- **🔗 API Endpoints** - RESTful API for admin and client UIs

## 🚀 **Quick Start**

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env` file and configure:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER_ID=your_phone_number_id
N8N_API_KEY=your_n8n_api_key_optional
PORT=3000
```

### 3. Database Setup
Run the SQL migration scripts in `data/` directory:
```bash
# Run in Supabase SQL Editor
data/add-multi-user-support.sql
```

### 4. Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

## 📡 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/user/permissions` - Get user permissions

### **Lead Management**
- `GET /api/leads` - Get user's leads
- `GET /api/lead-stats` - Get lead statistics
- `POST /api/leads/reset-status` - Reset lead statuses

### **Calling System**
- `POST /api/start-calling` - Start calling campaign
- `POST /api/start-user-calling/:userId` - Admin: Start calls for specific user
- `POST /api/stop-calling` - Stop active campaigns
- `POST /api/webhook/call-status` - VAPI webhook handler

### **Admin Endpoints**
- `GET /api/users/lead-summary` - All users and lead counts
- `GET /api/user/:userId/lead-stats` - Specific user stats
- `POST /api/n8n/trigger-calls/:userId` - n8n workflow integration

### **System**
- `GET /health` - Health check
- `GET /api/test-call` - Test VAPI integration

## 🏗️ **Architecture**

```
backend/
├── index.js              # Express server & API routes
├── lead-manager.js       # Core business logic
├── riya_system_prompt.js # AI assistant system prompt
├── .env                  # Environment variables
├── package.json          # Dependencies
└── railway.json          # Railway deployment config
```

## 🔐 **Security Features**

- **Row Level Security (RLS)** - Database-level user isolation
- **JWT Authentication** - Secure token-based auth
- **Permission-based Access** - Role-based endpoint protection
- **CORS Configuration** - Cross-origin request handling
- **Rate Limiting** - API abuse prevention

## 🚂 **Railway Deployment**

```bash
# Deploy to Railway
railway login
railway new "lead-calling-backend"
railway up

# Set environment variables
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
# ... add all environment variables

# Connect custom domain
railway domain add api.yourcompany.com
```

## 📊 **Monitoring**

- **Health Check**: `GET /health`
- **Railway Logs**: Real-time logging
- **Database Monitoring**: Supabase dashboard
- **VAPI Logs**: Call status and webhooks

## 🛠️ **Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (if available)
npm test
```

## 📝 **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key for admin access |
| `VAPI_API_KEY` | ✅ | VAPI API key for calls |
| `VAPI_PHONE_NUMBER_ID` | ✅ | VAPI phone number ID |
| `N8N_API_KEY` | ❌ | Optional n8n integration key |
| `PORT` | ❌ | Server port (default: 3000) |

## 🔗 **Related Services**

- **Admin Panel**: `admin.yourcompany.com` - Internal control panel
- **Client Dashboard**: `app.yourcompany.com` - End-user interface
- **Database**: Supabase PostgreSQL
- **Voice API**: VAPI for outbound calls

---

**🎯 This backend powers the entire AI Lead Qualification Platform with multi-user support and enterprise-grade security.**
