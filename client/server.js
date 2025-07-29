import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.CLIENT_PORT || 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Client Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing-new.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard-new.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'client-dashboard',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📊 Client Dashboard running on http://localhost:${PORT}`);
  console.log(`🔗 Backend API server: http://localhost:3000`);
  console.log(`🌐 Access dashboard at: http://localhost:${PORT}`);
});

export default app;
