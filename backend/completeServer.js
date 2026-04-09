import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import { authenticate } from './middleware/auth.js';

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
    message: 'Ascentia API running - Complete API Mode',
    routes: {
      auth: '/api/auth',
      employees: '/api/employees',
      dashboard: '/api/dashboard',
      leave: '/api/leave'
    }
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leave', leaveRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ascentia API running on http://localhost:${PORT}`);
  console.log('🔧 Complete API mode - all routes available');
  console.log('📊 Available endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register');
  console.log('  GET  /api/auth/me');
  console.log('  GET  /api/employees');
  console.log('  POST /api/employees');
  console.log('  PUT  /api/employees/:id');
  console.log('  DELETE /api/employees/:id');
  console.log('  GET  /api/dashboard/stats');
  console.log('  GET  /api/leave/my');
  console.log('  GET  /api/leave');
  console.log('  POST /api/leave');
  console.log('  PUT  /api/leave/:id');
});

export default app;
