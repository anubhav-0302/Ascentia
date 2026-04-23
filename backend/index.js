import { env } from './config/env.js';
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
import analyticsRoutes from './routes/analyticsRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import { requireAuth } from './middleware/auth.js';
import { initializeLeaveData } from './leaveStoreDB.js';
import { setupScheduledBackups } from './scripts/backup-system.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = env.PORT;

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));


// Initialize database on startup
const initializeDatabase = async () => {
  try {
    console.log("🔧 Initializing database...");
    await initializeLeaveData();
    
    // All seed config comes from the centralized env module
    const saltRounds = env.BCRYPT_SALT_ROUNDS;

    // Seed default organization if not exists
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: env.DEFAULT_ORG_NAME,
          subscriptionPlan: env.DEFAULT_ORG_PLAN,
          isActive: true
        }
      });
      console.log("✅ Created default organization:", env.DEFAULT_ORG_NAME);
    }
    
    // Seed default admin employee if not exists
    const existingAdmin = await prisma.employee.findFirst({
      where: { email: env.ADMIN_EMAIL }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, saltRounds);
      await prisma.employee.create({
        data: {
          name: env.ADMIN_NAME,
          email: env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          jobTitle: 'System Administrator',
          department: 'IT',
          location: 'Main Office',
          organizationId: org.id
        }
      });
      console.log("✅ Created default admin employee:", env.ADMIN_EMAIL);
    }
    
    // Seed default SuperAdmin if not exists
    const existingSuperAdmin = await prisma.employee.findFirst({
      where: { email: env.SUPERADMIN_EMAIL }
    });
    
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(env.SUPERADMIN_PASSWORD, saltRounds);
      await prisma.employee.create({
        data: {
          name: env.SUPERADMIN_NAME,
          email: env.SUPERADMIN_EMAIL,
          password: hashedPassword,
          role: 'superAdmin',
          status: 'active',
          jobTitle: 'Super Administrator',
          department: 'IT',
          location: 'Remote'
          // Super Admin not tied to any organization
        }
      });
      console.log("✅ Created default SuperAdmin:", env.SUPERADMIN_EMAIL);
    }
    
    // Seed default employee if not exists
    const existingEmployee = await prisma.employee.findFirst({
      where: { email: env.EMPLOYEE_EMAIL }
    });
    
    if (!existingEmployee) {
      const hashedPassword = await bcrypt.hash(env.EMPLOYEE_PASSWORD, saltRounds);
      await prisma.employee.create({
        data: {
          name: env.EMPLOYEE_NAME,
          email: env.EMPLOYEE_EMAIL,
          password: hashedPassword,
          role: 'employee',
          status: 'active',
          jobTitle: 'Software Engineer',
          department: 'Engineering',
          location: 'Main Office',
          organizationId: org.id
        }
      });
      console.log("✅ Created default employee:", env.EMPLOYEE_EMAIL);
    }
    
    // Check if roles need to be seeded
    const roleCount = await prisma.roleConfig.count();
    if (roleCount === 0) {
      console.log("🌱 No roles found, seeding default roles and permissions...");
      const { execSync } = await import('child_process');
      execSync('node scripts/seedRoleConfig.js', { 
        cwd: process.cwd(),
        stdio: 'inherit' 
      });
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
app.use('/api/analytics', requireAuth, analyticsRoutes);
app.use('/api/organizations', orgRoutes);

// Start server
app.listen(PORT, async () => {
  await initializeDatabase();
  
  // Start automatic backup system
  console.log('🔄 Starting automatic backup system...');
  setupScheduledBackups();
  console.log('✅ Automatic backups scheduled (daily at 2:00 AM)');
  
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
