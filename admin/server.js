import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Serve static files
app.use(express.static(__dirname));

// Main admin route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'admin-panel',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎛️ Admin Control Panel running on http://localhost:${PORT}`);
  console.log(`📊 Main API server should be running on http://localhost:3000`);
  console.log(`🔗 Access admin panel at: http://localhost:${PORT}`);
});

export default app;
