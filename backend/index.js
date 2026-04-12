import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { requireAuth } from './middleware/auth.js';
import { initializeLeaveData } from './leaveStoreDB.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Seed sample employees to database if none exist
const seedDefaultEmployees = async () => {
  try {
    const count = await prisma.employee.count();
    if (count === 0) {
      await prisma.employee.createMany({
        data: [
          { name: 'John Doe', email: 'john@ascentia.com', jobTitle: 'Software Engineer', department: 'Engineering', location: 'New York', status: 'Active' },
          { name: 'Jane Smith', email: 'jane@ascentia.com', jobTitle: 'Product Manager', department: 'Product', location: 'San Francisco', status: 'Active' },
          { name: 'Mike Johnson', email: 'mike@ascentia.com', jobTitle: 'UX Designer', department: 'Design', location: 'Remote', status: 'Remote' },
          { name: 'Sarah Williams', email: 'sarah@ascentia.com', jobTitle: 'DevOps Engineer', department: 'Engineering', location: 'London', status: 'Active' },
          { name: 'Tom Brown', email: 'tom@ascentia.com', jobTitle: 'Marketing Manager', department: 'Marketing', location: 'New York', status: 'Onboarding' },
          { name: 'Emily Davis', email: 'emily@ascentia.com', jobTitle: 'Data Analyst', department: 'Analytics', location: 'Remote', status: 'Remote' },
          { name: 'Chris Wilson', email: 'chris@ascentia.com', jobTitle: 'Backend Developer', department: 'Engineering', location: 'San Francisco', status: 'Active' },
          { name: 'Lisa Anderson', email: 'lisa@ascentia.com', jobTitle: 'HR Manager', department: 'Human Resources', location: 'New York', status: 'Active' }
        ]
      });
      console.log('✅ Seeded 8 sample employees to database');
    }
  } catch (err) {
    console.error('❌ Failed to seed employees:', err.message);
  }
};

// Seed default users into database if they don't exist
const seedDefaultUsers = async () => {
  try {
    const defaults = [
      { name: 'Admin User', email: 'admin@ascentia.com', password: 'admin123', role: 'admin' },
      { name: 'Employee User', email: 'employee@ascentia.com', password: '123456', role: 'employee' }
    ];
    for (const u of defaults) {
      const exists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!exists) {
        const hashed = await bcrypt.hash(u.password, 10);
        await prisma.user.create({ data: { name: u.name, email: u.email, password: hashed, role: u.role, status: 'active' } });
        console.log(`✅ Seeded default user: ${u.email}`);
      }
    }
  } catch (err) {
    console.error("❌ Failed to seed default users:", err.message);
  }
};

// Initialize database on startup
const initializeDatabase = async () => {
  try {
    console.log("🔧 Initializing database...");
    await seedDefaultUsers();
    await seedDefaultEmployees();
    await initializeLeaveData();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
};

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
    message: 'Ascentia API running - Complete API Mode with Database Persistence',
    routes: {
      auth: '/api/auth',
      employees: '/api/employees',
      dashboard: '/api/dashboard',
      leave: '/api/leave',
      notifications: '/api/notifications',
      users: '/api/users'
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
app.use('/api/users', requireAuth, userRoutes);

// Start server
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`🚀 Ascentia API running on http://localhost:${PORT}`);
  console.log('🔧 Complete API mode with database persistence - all routes available');
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
  console.log('  GET  /api/users (PROTECTED)');
  console.log('  POST /api/users (PROTECTED)');
  console.log('  GET  /api/users/:id (PROTECTED)');
  console.log('  PUT  /api/users/:id (PROTECTED)');
  console.log('  PUT  /api/users/:id/password (PROTECTED)');
  console.log('  DELETE /api/users/:id (PROTECTED)');
});

export default app;
