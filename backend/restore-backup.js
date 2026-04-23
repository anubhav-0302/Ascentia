import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { gunzipSync } from 'zlib';

const prisma = new PrismaClient();

// Find the latest backup with most data
const BACKUP_DIR = path.join(process.cwd(), 'backups');

async function restoreFromBackup() {
  console.log('🔄 Starting backup restoration...\n');
  
  try {
    // Find the largest backup file (likely has most data)
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db.gz'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        size: fs.statSync(path.join(BACKUP_DIR, f)).size
      }))
      .sort((a, b) => b.size - a.size);
    
    if (backupFiles.length === 0) {
      console.log('❌ No backup files found');
      return;
    }
    
    const latestBackup = backupFiles[0];
    console.log(`📦 Using backup: ${latestBackup.name}`);
    
    // Decompress and read backup
    const compressed = fs.readFileSync(latestBackup.path);
    const decompressed = gunzipSync(compressed);
    const backupData = JSON.parse(decompressed.toString());
    
    console.log('\n📊 Backup contains:');
    console.log(`- Organizations: ${backupData.organizations?.length || 0}`);
    console.log(`- Employees: ${backupData.employees?.length || 0}`);
    console.log(`- Permissions: ${backupData.permissions?.length || 0}`);
    console.log(`- Roles: ${backupData.roles?.length || 0}`);
    
    // Restore data in correct order
    console.log('\n🔄 Restoring data...');
    
    // 1. Restore organizations first
    if (backupData.organizations && backupData.organizations.length > 0) {
      console.log('Restoring organizations...');
      for (const org of backupData.organizations) {
        await prisma.organization.upsert({
          where: { id: org.id },
          update: org,
          create: org
        });
      }
      console.log(`✅ Restored ${backupData.organizations.length} organizations`);
    }
    
    // 2. Restore employees
    if (backupData.employees && backupData.employees.length > 0) {
      console.log('Restoring employees...');
      for (const emp of backupData.employees) {
        await prisma.employee.upsert({
          where: { id: emp.id },
          update: emp,
          create: emp
        });
      }
      console.log(`✅ Restored ${backupData.employees.length} employees`);
    }
    
    // 3. Restore roles
    if (backupData.roles && backupData.roles.length > 0) {
      console.log('Restoring roles...');
      for (const role of backupData.roles) {
        await prisma.role.upsert({
          where: { id: role.id },
          update: role,
          create: role
        });
      }
      console.log(`✅ Restored ${backupData.roles.length} roles`);
    }
    
    // 4. Restore permissions
    if (backupData.permissions && backupData.permissions.length > 0) {
      console.log('Restoring permissions...');
      for (const perm of backupData.permissions) {
        await prisma.permission.upsert({
          where: { id: perm.id },
          update: perm,
          create: perm
        });
      }
      console.log(`✅ Restored ${backupData.permissions.length} permissions`);
    }
    
    // 5. Restore other data if exists
    const otherTables = [
      'leave', 'timesheet', 'salaryComponent', 'employeeSalary',
      'performanceCycle', 'performanceGoal', 'performanceReview',
      'kRA', 'notification'
    ];
    
    for (const table of otherTables) {
      if (backupData[table] && backupData[table].length > 0) {
        console.log(`Restoring ${table}...`);
        const model = prisma[table.charAt(0).toLowerCase() + table.slice(1)];
        
        for (const record of backupData[table]) {
          try {
            await model.upsert({
              where: { id: record.id },
              update: record,
              create: record
            });
          } catch (e) {
            // Skip if table doesn't exist or other error
            console.log(`  ⚠️  Could not restore ${table}: ${e.message}`);
          }
        }
        console.log(`✅ Restored ${backupData[table].length} ${table} records`);
      }
    }
    
    console.log('\n✅ Backup restoration completed successfully!');
    
    // Verify restoration
    const counts = await prisma.$transaction([
      prisma.employee.count(),
      prisma.organization.count(),
      prisma.permission.count(),
      prisma.role.count()
    ]);
    
    console.log('\n📊 Current database state:');
    console.log(`- Employees: ${counts[0]}`);
    console.log(`- Organizations: ${counts[1]}`);
    console.log(`- Permissions: ${counts[2]}`);
    console.log(`- Roles: ${counts[3]}`);
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run restoration
restoreFromBackup().catch(console.error);
