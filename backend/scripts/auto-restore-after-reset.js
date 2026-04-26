#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { gunzipSync } from 'zlib';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path for cross-platform compatibility
const dbPath = path.resolve(__dirname, '..', 'dev.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function checkAndRestore() {
  console.log('🔍 Checking database state after reset...\n');
  
  try {
    // Check if database is empty
    const employeeCount = await prisma.employee.count();
    const roleCount = await prisma.roleConfig.count();
    const permissionCount = await prisma.permission.count();
    
    console.log(`Current state:`);
    console.log(`- Employees: ${employeeCount}`);
    console.log(`- Roles: ${roleCount}`);
    console.log(`- Permissions: ${permissionCount}`);
    
    if (employeeCount === 0 || roleCount === 0 || permissionCount === 0) {
      console.log('\n⚠️  Database appears to be reset. Initiating restore protocol...\n');
      
      // Ask user if they want to restore from backup
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Do you want to restore data from the latest backup? (y/n): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() === 'y') {
        await restoreFromBackup();
        await seedRolesAndPermissions();
      } else {
        console.log('\n📝 Skipping restore. Running basic setup...');
        await createBasicSetup();
      }
    } else {
      console.log('\n✅ Database has data, no restore needed.');
    }
    
  } catch (error) {
    console.error('❌ Error during check:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreFromBackup() {
  console.log('\n📦 Restoring from backup...');
  
  try {
    const backupDir = path.join(__dirname, '../backups');
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.db.gz'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        size: fs.statSync(path.join(backupDir, f)).size
      }))
      .sort((a, b) => b.size - a.size);
    
    if (backupFiles.length === 0) {
      console.log('❌ No backup files found');
      return;
    }
    
    const latestBackup = backupFiles[0];
    console.log(`Using backup: ${latestBackup.name}`);
    
    // Decompress backup
    const compressed = fs.readFileSync(latestBackup.path);
    const decompressed = gunzipSync(compressed);
    const tempDbPath = path.join(__dirname, '../temp-backup.db');
    fs.writeFileSync(tempDbPath, decompressed);
    
    // Open temporary database
    const tempDb = new Database(tempDbPath, { readonly: true });
    
    // Get organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          subscriptionPlan: 'free',
          isActive: true
        }
      });
    }
    
    // Restore employees
    const backupUsers = tempDb.prepare('SELECT * FROM Employee').all();
    const existingEmails = new Set(
      (await prisma.employee.findMany()).map(u => u.email)
    );
    
    const usersToRestore = backupUsers.filter(u => !existingEmails.has(u.email));
    
    for (const user of usersToRestore) {
      await prisma.employee.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          jobTitle: user.jobTitle || 'Employee',
          department: user.department || 'General',
          location: user.location || 'Office',
          role: user.role || 'employee',
          status: user.status || 'active',
          organizationId: org.id,
          phone: user.phone || null,
          address: user.address || null,
          managerId: user.managerId || null,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      });
    }
    
    console.log(`✅ Restored ${usersToRestore.length} users`);
    
    // Clean up
    tempDb.close();
    fs.unlinkSync(tempDbPath);
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
  }
}

async function seedRolesAndPermissions() {
  console.log('\n🌱 Seeding roles and permissions...');
  
  try {
    // Run the seed script
    const { execSync } = await import('child_process');
    execSync('node scripts/seedRoleConfig.js', { 
      cwd: path.dirname(__dirname),
      stdio: 'inherit' 
    });
  } catch (error) {
    console.error('❌ Failed to seed roles:', error);
  }
}

async function createBasicSetup() {
  console.log('\n🔧 Creating basic setup...');
  
  try {
    // Create organization
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: 'Default Organization',
          subscriptionPlan: 'free',
          isActive: true
        }
      });
    }
    
    // Create admin user
    const adminExists = await prisma.employee.findFirst({
      where: { email: 'admin@ascentia.com' }
    });
    
    if (!adminExists) {
      await prisma.employee.create({
        data: {
          name: 'Admin User',
          email: 'admin@ascentia.com',
          password: '$2a$10$K8ZpdrjwzUWSTmtyYoNb6uj8.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6',
          role: 'admin',
          jobTitle: 'System Administrator',
          department: 'IT',
          location: 'Remote',
          status: 'Active',
          organizationId: org.id
        }
      });
      console.log('✅ Created admin user (admin@ascentia.com / admin123)');
    }
    
    // Seed roles
    await seedRolesAndPermissions();
    
  } catch (error) {
    console.error('❌ Basic setup failed:', error);
  }
}

// Run the check
checkAndRestore();
