import fs from 'fs';
import path from 'path';
import { gunzipSync } from 'zlib';
import Database from 'better-sqlite3';
import prisma from './lib/prisma.js';

async function restoreUsersFromBackup() {
  console.log('🔄 Restoring users from backup...\n');
  
  try {
    // Find the largest backup file
    const backupDir = path.join(process.cwd(), 'backups');
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
    console.log(`📦 Using backup: ${latestBackup.name} (${latestBackup.size} bytes)`);
    
    // Decompress backup to temporary file
    const compressed = fs.readFileSync(latestBackup.path);
    const decompressed = gunzipSync(compressed);
    
    const tempDbPath = path.join(process.cwd(), 'temp-backup.db');
    fs.writeFileSync(tempDbPath, decompressed);
    console.log('✅ Backup decompressed to temporary database');
    
    // Open the temporary database
    const tempDb = new Database(tempDbPath, { readonly: true });
    
    // Get all users from backup
    const backupUsers = tempDb.prepare('SELECT * FROM Employee').all();
    console.log(`\n👥 Found ${backupUsers.length} users in backup:`);
    
    backupUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Get current users
    const currentUsers = await prisma.employee.findMany();
    console.log(`\n📊 Current database has ${currentUsers.length} users`);
    
    // Find users not in current database
    const existingEmails = new Set(currentUsers.map(u => u.email));
    const usersToRestore = backupUsers.filter(u => !existingEmails.has(u.email));
    
    console.log(`\n➕ Need to restore ${usersToRestore.length} users:`);
    usersToRestore.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    // Restore missing users
    if (usersToRestore.length > 0) {
      // Get the organization ID
      const org = await prisma.organization.findFirst();
      if (!org) {
        console.log('❌ No organization found');
        return;
      }
      
      console.log(`\n💾 Restoring users to organization: ${org.name}`);
      
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
        console.log(`✅ Restored: ${user.name}`);
      }
    }
    
    // Clean up temporary file
    tempDb.close();
    fs.unlinkSync(tempDbPath);
    
    // Verify final state
    const finalUserCount = await prisma.employee.count();
    console.log(`\n📊 Final user count: ${finalUserCount}`);
    
    // Show all users
    const allUsers = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        organizationId: true
      },
      orderBy: { id: 'asc' }
    });
    
    console.log('\n👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`ID: ${user.id} | ${user.name} | ${user.email} | ${user.role} | ${user.department} | Org: ${user.organizationId}`);
    });
    
    console.log('\n✅ User restoration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreUsersFromBackup().catch(console.error);
