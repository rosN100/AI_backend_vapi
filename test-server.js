import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3002', 'http://127.0.0.1:3002'],
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test users endpoint
app.get('/api/admin/users', (req, res) => {
  res.json({ 
    success: true, 
    users: [
      { id: 1, email: 'admin@soraaya.ai', full_name: 'Admin User', status: 'active', role: 'admin' }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server listening on port ${PORT}`);
});
