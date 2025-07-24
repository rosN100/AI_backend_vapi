# Production Deployment Checklist

## Pre-Deployment

### Code Quality
- [x] Remove unused files and routes
- [x] Organize project structure
- [x] Update file paths and imports
- [x] Clean up console.log statements (optional)
- [ ] Add error handling for all async operations
- [ ] Implement proper logging (consider winston or similar)

### Security
- [ ] Review and update CORS settings
- [ ] Implement rate limiting
- [ ] Add input validation middleware
- [ ] Review authentication middleware
- [ ] Ensure HTTPS in production
- [ ] Update session security settings

### Environment
- [ ] Create production .env file
- [ ] Verify all environment variables
- [ ] Test database connections
- [ ] Verify API key configurations
- [ ] Set NODE_ENV=production

### Performance
- [ ] Add compression middleware
- [ ] Implement caching where appropriate
- [ ] Optimize database queries
- [ ] Add database connection pooling
- [ ] Consider CDN for static assets

## Deployment Steps

1. **Environment Setup**
   ```bash
   # Set production environment
   export NODE_ENV=production
   
   # Install production dependencies only
   npm ci --only=production
   ```

2. **Database Migration**
   ```bash
   # Run database migrations
   # Import schemas from data/ folder
   ```

3. **Start Application**
   ```bash
   # Using PM2 for production
   npm install -g pm2
   pm2 start index.js --name "soraaya-ai"
   pm2 save
   pm2 startup
   ```

4. **Health Check**
   ```bash
   # Test all endpoints
   curl http://localhost:3000/
   curl http://localhost:3000/login
   curl http://localhost:3000/api/verify-session
   ```

## Post-Deployment

### Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up uptime monitoring
- [ ] Monitor database performance
- [ ] Set up log aggregation

### Backup
- [ ] Configure database backups
- [ ] Set up code repository backups
- [ ] Document recovery procedures

### Documentation
- [ ] Update API documentation
- [ ] Create user guides
- [ ] Document deployment procedures
- [ ] Create troubleshooting guide

## Quick Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Check logs
pm2 logs soraaya-ai

# Restart application
pm2 restart soraaya-ai

# Stop application
pm2 stop soraaya-ai
```

## Environment Variables Checklist

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# VAPI Configuration
VAPI_API_KEY=
VAPI_ASSISTANT_ID=
VAPI_PHONE_NUMBER_ID=

# Database Configuration
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Sheets Integration
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_SPREADSHEET_ID=

# External Services
N8N_RESULTS_URL=
```

## Testing Checklist

- [ ] Landing page loads correctly
- [ ] Login functionality works
- [ ] Dashboard displays properly
- [ ] Leads page shows data
- [ ] Navigation works correctly
- [ ] User authentication flows
- [ ] API endpoints respond correctly
- [ ] Database connections stable
- [ ] Error handling works
- [ ] Mobile responsiveness
