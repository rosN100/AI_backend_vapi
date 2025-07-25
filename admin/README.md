# 🎛️ Admin Control Panel

Internal administration interface for managing the AI Lead Qualification Platform.

## 🎯 **What This Service Does**

- **🎛️ System Control** - Start/stop campaigns, manage users
- **📊 Real-time Monitoring** - Live stats, logs, and system health
- **👥 User Management** - View all clients and their leads
- **📋 Lead Operations** - Bulk management and status updates
- **⚡ Quick Actions** - Test calls, emergency stops, diagnostics
- **🔍 System Logs** - Real-time monitoring and debugging

## 🚀 **Quick Start**

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Admin Panel
```bash
npm start
```

### 3. Access Interface
Open `http://localhost:3001`

**Note:** Backend API must be running on port 3000

## 🎛️ **Admin Features**

### **📊 System Overview**
- Total users, leads, active calls
- Today's call statistics
- Real-time system health
- Performance metrics

### **🚀 Campaign Control**
- Start campaigns for specific users
- Configure lead limits and concurrency
- Set priority and metadata
- Monitor active campaigns

### **👥 User Management**
- View all users and lead counts
- Quick campaign triggers
- User-specific statistics
- Bulk operations

### **📋 Lead Management**
- Filter by user and status
- View detailed lead info
- Bulk status resets
- Import/export capabilities

### **📝 System Logs**
- Real-time log monitoring
- Filter by level and service
- Clear logs functionality
- Export for analysis

### **⚡ Quick Actions**
- Test VAPI connection
- Database connectivity test
- Trigger test calls
- Emergency stop campaigns
- Health checks

## 🔐 **Security**

**Recommended for Production:**
- IP whitelisting to company IPs
- Basic authentication
- HTTPS only
- VPN access requirement
- Audit logging

## 🚂 **Railway Deployment**

```bash
# Deploy to Railway
railway login
railway new "lead-calling-admin"
railway up

# Set environment variables
railway variables set CLIENT_PORT=3001
railway variables set API_BASE_URL=https://api.yourcompany.com

# Connect custom domain
railway domain add admin.yourcompany.com
```

## 📡 **API Integration**

Connects to backend API for all operations:
- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourcompany.com`

## 🛠️ **File Structure**

```
admin/
├── index.html      # Admin interface
├── server.js       # Express server
├── package.json    # Dependencies
├── railway.json    # Railway config
└── README.md       # Documentation
```

## 🚨 **Troubleshooting**

**Cannot connect to API:**
- Check backend server is running
- Verify API_BASE_URL environment variable
- Check CORS configuration

**Admin panel not loading:**
- Verify port 3001 is available
- Check Railway deployment logs
- Review browser console

---

**🎛️ Complete administrative control for your AI Lead Qualification Platform.**
