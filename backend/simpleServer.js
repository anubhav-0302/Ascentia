import express from 'express';
import cors from 'cors';
import { register, login, getCurrentUser } from './simpleAuthController.js';
import { getDashboardStats } from './dashboardController.js';
import { authenticate, authorize } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Ascentia API running - Authentication Test Mode' });
});

// Authentication routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticate, getCurrentUser);

// Dashboard routes
app.get('/api/dashboard/stats', authenticate, getDashboardStats);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ascentia API running on http://localhost:${PORT}`);
  console.log('🔧 Authentication test mode - using in-memory user store');
});

export default app;
