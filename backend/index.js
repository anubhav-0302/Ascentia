import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging for all requests
app.use((req, res, next) => {
  console.log("🔍 REQUEST:", req.method, req.url);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ascentia API running - Complete API Mode with Notification System',
    routes: {
      auth: '/api/auth',
      employees: '/api/employees',
      dashboard: '/api/dashboard',
      leave: '/api/leave',
      notifications: '/api/notifications'
    }
  });
});

// PUBLIC routes (no authentication required)
app.use('/api/auth', authRoutes);

// PROTECTED routes (authentication required)
app.use('/api/employees', requireAuth, employeeRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/leave', requireAuth, leaveRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ascentia API running on http://localhost:${PORT}`);
  console.log('🔧 Complete API mode with notification system - all routes available');
  console.log('📊 Available endpoints:');
  console.log('  POST /api/auth/login (PUBLIC)');
  console.log('  POST /api/auth/register (PUBLIC)');
  console.log('  GET  /api/auth/me (PROTECTED)');
  console.log('  GET  /api/employees (PROTECTED)');
  console.log('  POST /api/employees (PROTECTED)');
  console.log('  PUT  /api/employees/:id (PROTECTED)');
  console.log('  DELETE /api/employees/:id (PROTECTED)');
  console.log('  GET  /api/dashboard/stats (PROTECTED)');
  console.log('  GET  /api/leave/my (PROTECTED)');
  console.log('  GET  /api/leave (PROTECTED)');
  console.log('  POST /api/leave (PROTECTED)');
  console.log('  PUT  /api/leave/:id (PROTECTED)');
  console.log('  GET  /api/notifications (PROTECTED)');
  console.log('  GET  /api/notifications/unread-count (PROTECTED)');
  console.log('  PUT  /api/notifications/:id/read (PROTECTED)');
  console.log('  PUT  /api/notifications/read-all (PROTECTED)');
  console.log('  DELETE /api/notifications (PROTECTED)');
});

export default app;
