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
- 📈 **Performance Analytics** - Charts showing campaign success rates
- 🔍 **Lead Insights** - Detailed qualification results and trends
- 📱 **Mobile Responsive** - Access from any device

### **For Administrators:**
- 🎛️ **Complete Control** - Start/stop campaigns, manage users
- 👥 **User Management** - View all clients and their leads
- 📊 **System Monitoring** - Real-time stats, logs, and health checks
- ⚡ **Quick Actions** - Test calls, emergency stops, diagnostics

### **Backend Capabilities:**
- 🤖 **AI-Powered Calling** - Automated lead qualification via VAPI
- 🗄️ **Multi-User Database** - Secure data isolation with PostgreSQL
- 📞 **Campaign Management** - Batch calling with concurrency control
- 🔐 **Enterprise Security** - Row-level security and authentication
- 📊 **Real-time Analytics** - Live stats and reporting
- 🔗 **API Integrations** - n8n workflows and webhook support

## 🚀 **Quick Start**

### **1. Backend API Setup**
```bash
cd backend
npm install
# Configure .env file
npm start  # Runs on port 3000
```

### **2. Admin Panel Setup**
```bash
cd admin
npm install
npm start  # Runs on port 3001
```

### **3. Client Dashboard Setup**
```bash
cd client
npm install
npm start  # Runs on port 3002
```

## 📁 **Project Structure**

```
AI-Lead-Qualification-Platform/
├── backend/              # 🔌 Backend API Server
│   ├── index.js         # Express server & routes
│   ├── lead-manager.js  # Core business logic
│   ├── data/           # SQL scripts & migrations
│   ├── .env            # Environment variables
│   └── README.md       # Backend documentation
├── admin/               # 🎛️ Admin Control Panel
│   ├── index.html      # Admin interface
│   ├── server.js       # Static server
│   └── README.md       # Admin documentation
├── client/              # 📊 Client Dashboard
│   ├── public/         # Static HTML files
│   ├── static/         # Assets (CSS, JS, images)
│   ├── server.js       # Static server
│   └── README.md       # Client documentation
└── data/               # 🗄️ Database Scripts
    ├── add-multi-user-support.sql
    └── check-lead-status.sql
```

## 🌐 **Deployment Strategy**

### **Railway Deployment (Recommended)**
Deploy all three services to Railway with custom domains:

```bash
# Backend API
cd backend && railway new "lead-calling-backend" && railway up
# → api.yourcompany.com

# Admin Panel  
cd admin && railway new "lead-calling-admin" && railway up
# → admin.yourcompany.com

# Client Dashboard
cd client && railway new "lead-calling-client" && railway up
# → app.yourcompany.com
```

**Total Cost: ~$15/month for all three services**

## 🔧 **Technology Stack**

### **Backend**
- **Node.js + Express** - API server
- **Supabase (PostgreSQL)** - Database with RLS
- **VAPI** - AI voice calling platform
- **JWT Authentication** - Secure user sessions

### **Frontend**
- **Vanilla HTML/CSS/JS** - Clean, fast interfaces
- **Chart.js** - Data visualizations
- **Responsive Design** - Mobile-first approach

### **Infrastructure**
- **Railway** - Cloud deployment platform
- **Custom Domains** - Professional URLs
- **SSL/HTTPS** - Secure connections
- **Health Monitoring** - Automatic restarts

## 🔐 **Security Features**

- **Row Level Security (RLS)** - Database-level user isolation
- **JWT Authentication** - Secure token-based auth
- **Permission-based Access** - Role-based endpoint protection
- **CORS Configuration** - Cross-origin request handling
- **Environment Variables** - Secure configuration management
- **Admin Access Control** - Separate admin authentication

## 📊 **Key Features**

### **Multi-User Support**
- Complete data isolation between users
- User-specific lead management
- Admin oversight of all users
- Scalable architecture

### **AI Lead Qualification**
- Automated outbound calling via VAPI
- Real-time conversation analysis
- Lead scoring and qualification
- Human intervention when needed

### **Campaign Management**
- Batch calling with concurrency control
- Campaign priority and metadata
- Real-time monitoring and control
- Emergency stop capabilities

### **Analytics & Reporting**
- Real-time dashboard metrics
- Lead qualification funnel
- Success rate tracking
- Export capabilities

## 🛠️ **Development**

### **Local Development**
```bash
# Start all services
npm run dev:backend   # Port 3000
npm run dev:admin     # Port 3001  
npm run dev:client    # Port 3002
```

### **Environment Variables**
Each service requires specific environment variables. See individual README files for details.

## 📚 **Documentation**

- **Backend API**: [backend/README.md](backend/README.md)
- **Admin Panel**: [admin/README.md](admin/README.md)
- **Client Dashboard**: [client/README.md](client/README.md)

## 🚨 **Support**

For technical support:
1. Check individual service README files
2. Review Railway deployment logs
3. Check API health endpoints
4. Verify environment variables

---

**🤖 Complete AI Lead Qualification Platform with enterprise-grade security, multi-user support, and professional client/admin interfaces.**
