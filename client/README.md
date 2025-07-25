# 📊 Client Dashboard

Clean, professional dashboard for clients to view their lead qualification results and insights.

## 🎯 **What This Service Does**

- **📊 Results Dashboard** - Clean UI showing lead qualification metrics
- **📈 Performance Analytics** - Charts and insights from calling campaigns
- **🔍 Lead Insights** - Detailed lead qualification results
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🔐 Secure Access** - User authentication and permissions
- **⚡ Real-time Updates** - Live data from ongoing campaigns

## 🚀 **Quick Start**

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Client Dashboard
```bash
npm start
```

### 3. Access Dashboard
Open `http://localhost:3002`

**Note:** Backend API must be running on port 3000

## 📊 **Dashboard Features**

### **🏠 Landing Page**
- Professional company branding
- Service overview and benefits
- Call-to-action for client access
- Contact information

### **🔐 Login System**
- Secure client authentication
- Email and password login
- Session management
- Access control

### **📈 Main Dashboard**
- **Key Metrics Cards**: Total calls, answered calls, qualified leads, human interventions
- **Success Rate Chart**: Visual qualification success percentage
- **Lead Funnel**: Progression from contact to qualified leads
- **Real-time Updates**: Live data from ongoing campaigns

### **📱 Responsive Design**
- Desktop-optimized layout
- Tablet-friendly interface
- Mobile-responsive design
- Cross-browser compatibility

## 🎨 **UI Components**

### **Metrics Cards**
- Total calls attempted
- Calls answered (with percentage)
- Leads qualified (with percentage)
- Human interventions required

### **Charts & Visualizations**
- Donut chart for qualification success rate
- Horizontal bar chart for lead funnel
- Color-coded status indicators
- Interactive hover effects

### **Navigation**
- Clean sidebar navigation
- Dashboard, Leads, Insights, Notifications
- User profile and logout
- System administrator indicator

## 🚂 **Railway Deployment**

```bash
# Deploy to Railway
railway login
railway new "lead-calling-client"
railway up

# Set environment variables
railway variables set CLIENT_PORT=3002
railway variables set API_BASE_URL=https://api.yourcompany.com

# Connect custom domain
railway domain add app.yourcompany.com
```

## 📡 **API Integration**

Connects to backend API for all data:
- **Development**: `http://localhost:3000`
- **Production**: `https://api.yourcompany.com`

### **API Endpoints Used**
- `GET /api/user/permissions` - User authentication
- `GET /api/lead-stats` - Dashboard metrics
- `GET /api/leads` - Lead data for charts
- `POST /api/auth/logout` - User logout

## 🛠️ **File Structure**

```
client/
├── public/             # Static HTML files
│   ├── landing.html    # Landing page
│   ├── login.html      # Login interface
│   └── dashboard.html  # Main dashboard
├── static/             # Assets (CSS, JS, images)
├── server.js           # Express server
├── package.json        # Dependencies
├── railway.json        # Railway config
└── README.md           # Documentation
```

## 🎨 **Customization**

### **Branding**
Update company branding in HTML files:
- Company name and logo
- Color scheme and styling
- Contact information
- Service descriptions

### **Metrics**
Customize dashboard metrics:
- Add new KPI cards
- Modify chart types
- Update color schemes
- Add custom visualizations

## 🔐 **Security Features**

- **Authentication Required** - All dashboard pages protected
- **Session Management** - Secure login sessions
- **CORS Protection** - Configured for API access
- **HTTPS Ready** - SSL/TLS support
- **Input Validation** - Client-side form validation

## 📱 **Browser Support**

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🚨 **Troubleshooting**

**Dashboard not loading:**
- Check if backend API is running
- Verify API_BASE_URL configuration
- Check browser console for errors

**Login issues:**
- Verify user credentials in database
- Check authentication API endpoints
- Review session cookie settings

**Charts not displaying:**
- Check API data format
- Verify JavaScript console for errors
- Ensure all dependencies loaded

**Mobile display issues:**
- Test responsive CSS breakpoints
- Check viewport meta tag
- Verify touch interactions

---

**📊 Professional client dashboard providing clean, focused insights from your AI Lead Qualification Platform.**
