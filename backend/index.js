import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import kraRoutes from './routes/kraRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import logsRoutes from './routes/logsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import roleManagementRoutes from './routes/roleManagementRoutes.js';
import dataProtectionRoutes from './routes/dataProtectionRoutes.js';
import { requireAuth } from './middleware/auth.js';
import { initializeLeaveData } from './leaveStoreDB.js';
// import { setupScheduledBackups } from './scripts/backup-system.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));


// Initialize database on startup
const initializeDatabase = async () => {
  try {
    console.log("🔧 Initializing database...");
    await initializeLeaveData();
    
    // Seed default admin employee if not exists
    const adminEmail = 'admin@ascentia.com';
    const existingAdmin = await prisma.employee.findFirst({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.employee.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          jobTitle: 'System Administrator',
          department: 'IT',
          location: 'Main Office'
        }
      });
      console.log("✅ Created default admin employee:", adminEmail);
    }
    
    // Seed default employee if not exists
    const employeeEmail = 'employee@ascentia.com';
    const existingEmployee = await prisma.employee.findFirst({
      where: { email: employeeEmail }
    });
    
    if (!existingEmployee) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await prisma.employee.create({
        data: {
          name: 'John Doe',
          email: employeeEmail,
          password: hashedPassword,
          role: 'employee',
          status: 'active',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          location: 'Main Office'
        }
      });
      console.log("✅ Created default employee:", employeeEmail);
    }
    
    
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
      users: '/api/users',
      settings: '/api/settings'
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
app.use('/api/timesheet', requireAuth, timesheetRoutes);
app.use('/api/performance', requireAuth, performanceRoutes);
app.use('/api/kras', requireAuth, kraRoutes);
app.use('/api/payroll', requireAuth, payrollRoutes);
app.use('/api/logs', requireAuth, logsRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/documents', requireAuth, documentRoutes);
app.use('/api/admin/roles', roleManagementRoutes);
app.use('/api/data-protection', requireAuth, dataProtectionRoutes);

// Start server
app.listen(PORT, async () => {
  await initializeDatabase();
  
  // Start automatic backup system (temporarily disabled)
  // console.log('🔄 Starting automatic backup system...');
  // setupScheduledBackups();
  // console.log('✅ Automatic backups scheduled (daily at 2:00 AM)');
  
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
  console.log('  GET  /api/timesheet (PROTECTED)');
  console.log('  GET  /api/timesheet/all (PROTECTED)');
  console.log('  POST /api/timesheet (PROTECTED)');
  console.log('  PUT  /api/timesheet/:id (PROTECTED)');
  console.log('  PUT  /api/timesheet/:id/approve (PROTECTED)');
  console.log('  DELETE /api/timesheet/:id (PROTECTED)');
  console.log('  GET  /api/timesheet/history (PROTECTED)');
  console.log('  GET  /api/performance/cycles (PROTECTED)');
  console.log('  POST /api/performance/cycles (PROTECTED)');
  console.log('  GET  /api/performance/goals (PROTECTED)');
  console.log('  POST /api/performance/goals (PROTECTED)');
  console.log('  PUT  /api/performance/goals/:id (PROTECTED)');
  console.log('  GET  /api/performance/reviews (PROTECTED)');
  console.log('  POST /api/performance/reviews (PROTECTED)');
  console.log('  PUT  /api/performance/reviews/:id (PROTECTED)');
  console.log('  GET  /api/payroll/salary-components (PROTECTED)');
  console.log('  POST /api/payroll/salary-components (PROTECTED)');
  console.log('  PUT  /api/payroll/salary-components/:id (PROTECTED)');
  console.log('  DELETE /api/payroll/salary-components/:id (PROTECTED)');
  console.log('  GET  /api/payroll/employee-salaries (PROTECTED)');
  console.log('  POST /api/payroll/employee-salaries (PROTECTED)');
  console.log('  PUT  /api/payroll/employee-salaries/:id (PROTECTED)');
});

export default app;
