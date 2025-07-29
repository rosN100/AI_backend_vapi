# Soraaya AI Lead Qualification Platform V1 - Technical Overview

## 🏗️ Architecture

**Modern Python Stack:**
- **Backend**: FastAPI server (Port 8000)
- **Frontend**: Streamlit multi-page application (Port 8501)
- **Database**: Supabase PostgreSQL with RLS policies

## 🔧 Core Technologies

- **Backend**: Python 3.9+, FastAPI, Supabase Python Client
- **Frontend**: Streamlit, Plotly/Altair for charts, Python
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT tokens with Streamlit session state
- **Voice AI**: VAPI integration for automated calling
- **Testing**: Pytest with Streamlit testing framework

## 📊 Key Features

### 1. **Lead Management System**
- Automated lead calling with VAPI integration
- 11 lead statuses (to_call, calling, qualified, etc.)
- Concurrency control (max 4 simultaneous calls)
- Real-time status tracking and updates

### 2. **Streamlit Multi-Page Frontend**
- **Dashboard Page**: Real-time metrics, call analytics, performance charts
- **Leads Page**: Lead management, status updates, filtering
- **Campaigns Page**: Campaign creation, management, performance tracking
- **Agent Persona Page**: AI agent configuration and persona management
- **Insights Page**: Advanced analytics, call transcript analysis
- **Notifications Page**: Human intervention alerts and system notifications
- **Settings Page**: User preferences and system configuration

### 3. **User Management**
- **Role-based Access Control**: Admin vs General users
- **Permission System**: manage_leads, start_campaigns, view_analytics, export_data
- **Session Management**: Secure JWT-based authentication

### 3. **Authentication & Navigation**
- **Landing Page**: Pre-login marketing page with platform overview
- **Login System**: Secure authentication with session management
- **Navigation**: Streamlit sidebar with page routing and user profile
- **Session State**: Persistent user data across page navigation

### 4. **Call Analytics Engine**
- **Call Tracking**: Duration, outcome, timing data
- **Performance Metrics**: Answer rates, qualification rates
- **Data Views**: Optimized PostgreSQL views for analytics
- **Interactive Charts**: Plotly/Altair visualizations with real-time updates

## 🗄️ Database Schema

### Core Tables:
- **`leads`**: Property info, contact details, call tracking
- **`campaigns`**: Campaign management and configuration
- **`call_analytics`**: Call timing, outcomes, performance data
- **`agent_personas`**: AI agent configuration and personas
- **`notifications`**: Human intervention alerts and system events
- **`users`**: Authentication and user management
- **`user_profiles`**: Role-based permissions
- **`user_sessions`**: Session token management
- **`vapi_calls`**: VAPI integration tracking

### Analytics Views:
- **`call_timing_analytics`**: Hourly call performance
- **`lead_source_analytics`**: Source-based qualification rates

## 🔌 FastAPI Endpoints

### Authentication:
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Session termination
- `GET /auth/verify` - Token validation
- `GET /auth/user` - Current user profile

### Lead Management:
- `GET /leads` - Fetch leads with filtering
- `POST /leads` - Create new lead
- `PUT /leads/{id}` - Update lead details
- `DELETE /leads/{id}` - Remove lead
- `GET /leads/stats` - Lead statistics

### Campaign Management:
- `GET /campaigns` - List all campaigns
- `POST /campaigns` - Create new campaign
- `PUT /campaigns/{id}` - Update campaign
- `POST /campaigns/{id}/start` - Start campaign
- `POST /campaigns/{id}/stop` - Stop campaign

### Agent Personas:
- `GET /personas` - List agent personas
- `POST /personas` - Create new persona
- `PUT /personas/{id}` - Update persona
- `DELETE /personas/{id}` - Remove persona

### Analytics:
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/call-times` - Call timing data
- `GET /analytics/lead-sources` - Source performance
- `GET /analytics/insights` - Advanced insights

### Notifications:
- `GET /notifications` - User notifications
- `POST /notifications/mark-read` - Mark as read
- `GET /notifications/alerts` - Human intervention alerts

### Webhooks:
- `POST /webhook/vapi` - VAPI call completion events

## 🚀 Deployment Architecture

### Local Development:
```
Backend:   http://localhost:8000 (FastAPI)
Frontend:  http://localhost:8501 (Streamlit)
Database:  Supabase Cloud
Docs:      http://localhost:8000/docs (Auto-generated API docs)
```

### Production Ready:
- **Backend**: Railway/Heroku deployment (FastAPI)
- **Frontend**: Streamlit Cloud hosting
- **Database**: Supabase production instance
- **Monitoring**: FastAPI built-in metrics and Streamlit analytics

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure session management with Streamlit
- **CORS Configuration**: Cross-origin request protection
- **Input Validation**: Pydantic schema validation
- **Permission Middleware**: FastAPI dependency injection
- **Session State Security**: Streamlit secure session management

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries for analytics
- **Async Processing**: FastAPI async/await patterns
- **Caching Strategy**: Streamlit session state caching
- **Connection Pooling**: Supabase connection management
- **Page Caching**: Streamlit component caching for performance

## 🧪 Testing Strategy

### Automated Test Suite:
- **Unit Tests**: FastAPI endpoints with pytest
- **Integration Tests**: Streamlit page functionality
- **E2E Tests**: Complete user workflows with Selenium
- **Performance Tests**: FastAPI response time validation
- **Security Tests**: Authentication and authorization

### Test Coverage:
- Database integrity and constraints
- FastAPI endpoint functionality
- Streamlit page rendering and interactions
- Error handling and edge cases
- Multi-page navigation and session state

## 📦 Project Structure

```
soraaya-v1/
├── backend/
│   ├── main.py               # FastAPI main server
│   ├── routers/              # API route modules
│   │   ├── auth.py          # Authentication routes
│   │   ├── leads.py         # Lead management
│   │   ├── campaigns.py     # Campaign management
│   │   ├── personas.py      # Agent persona routes
│   │   ├── analytics.py     # Analytics endpoints
│   │   └── notifications.py # Notification routes
│   ├── models/              # Pydantic models
│   ├── services/            # Business logic
│   │   └── lead_manager.py  # Lead calling logic
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── app.py               # Main Streamlit app
│   ├── pages/               # Streamlit pages
│   │   ├── 1_Dashboard.py   # Dashboard page
│   │   ├── 2_Leads.py       # Leads management
│   │   ├── 3_Campaigns.py   # Campaign management
│   │   ├── 4_Agent_Persona.py # AI agent config
│   │   ├── 5_Insights.py    # Advanced analytics
│   │   └── 6_Notifications.py # Alerts & notifications
│   ├── components/          # Reusable components
│   ├── utils/               # Helper functions
│   └── requirements.txt     # Streamlit dependencies
├── data/
│   ├── leads-schema.sql     # Database schema
│   ├── campaigns-schema.sql # Campaign tables
│   ├── personas-schema.sql  # Agent persona tables
│   └── notifications-schema.sql # Notification tables
├── tests/
│   ├── test_api.py          # FastAPI tests
│   ├── test_streamlit.py    # Streamlit tests
│   └── conftest.py          # Test configuration
└── .env                     # Environment config
```

## 🔄 Data Flow

1. **User Authentication** → Landing page → Login → Streamlit session
2. **Lead Import** → Supabase leads table via Leads page
3. **Campaign Creation** → Campaign page → Agent persona selection
4. **VAPI Calling** → Automated voice interactions with persona
5. **Webhook Processing** → Call results → Notifications page
6. **Analytics Generation** → Insights page → Dashboard updates
7. **Multi-page Navigation** → Streamlit sidebar routing

## 🎯 Key Metrics Tracked

- **Call Performance**: Answer rates, duration, timing by persona
- **Lead Quality**: Qualification rates by source and campaign
- **Campaign Efficiency**: Calls per hour, success rates, persona performance
- **Agent Persona Analytics**: Conversion rates by persona type
- **User Activity**: Page navigation, session duration, feature usage
- **System Health**: FastAPI response times, Streamlit performance

## 🚦 Current Status

✅ **V1 Features to Implement:**
- FastAPI backend with modular router structure
- Streamlit multi-page frontend application
- Campaign management system
- Agent persona configuration
- Advanced insights and analytics
- Notification system for human intervention
- Landing page and authentication flow

🔄 **Development Ready:**
- Modern Python stack architecture
- Auto-generated API documentation
- Streamlit Cloud deployment ready
- Pydantic data validation
- Async processing capabilities
- Component-based frontend structure

---

*This V1 platform provides a modern Python-based solution for luxury real estate lead qualification with AI-powered calling, advanced campaign management, and comprehensive analytics through an intuitive Streamlit interface.*
