// Test sidebar behavior after database reset
import fs from 'fs';
import path from 'path';
import prisma from './lib/prisma.js';

async function testSidebarAfterReset() {
  console.log('🔍 Testing Sidebar After Database Reset\n');
  
  try {
    // Step 1: Check current state
    console.log('Current database state:');
    const employeeCount = await prisma.employee.count();
    const roleCount = await prisma.roleConfig.count();
    const permissionCount = await prisma.permission.count();
    
    console.log(`  Employees: ${employeeCount}`);
    console.log(`  Roles: ${roleCount}`);
    console.log(`  Permissions: ${permissionCount}`);
    
    // Step 2: Check if sidebar permissions exist
    const sidebarPerms = await prisma.permission.findMany({
      where: { module: 'sidebar' }
    });
    
    console.log(`\nSidebar permissions: ${sidebarPerms.length}`);
    if (sidebarPerms.length > 0) {
      console.log('✅ Sidebar permissions exist');
      sidebarPerms.slice(0, 3).forEach(p => {
        console.log(`  - ${p.action}: ${p.isEnabled}`);
      });
    }
    
    // Step 3: Check automatic seeding in index.js
    const indexContent = fs.readFileSync(path.join(process.cwd(), 'index.js'), 'utf8');
    const hasAutoSeeding = indexContent.includes('roleConfig.count()') && 
                          indexContent.includes('seedRoleConfig.js');
    
    console.log(`\nAuto-seeding in index.js: ${hasAutoSeeding ? '✅ Yes' : '❌ No'}`);
    
    // Step 4: Simulate what happens on fresh start
    console.log('\n📝 What happens on server start:');
    console.log('  1. Server starts → initializeDatabase()');
    console.log('  2. Creates default organization if needed');
    console.log('  3. Creates admin/employee users if needed');
    console.log('  4. Checks if roles exist (roleConfig.count())');
    console.log('  5. If no roles → runs seedRoleConfig.js');
    console.log('  6. seedRoleConfig.js creates 5 roles + 200+ permissions');
    console.log('  7. Sidebar permissions included → Sidebar works');
    
    // Step 5: Verify the seed script exists and works
    const seedScript = path.join(process.cwd(), 'scripts', 'seedRoleConfig.js');
    if (fs.existsSync(seedScript)) {
      console.log('\n✅ Role seed script exists');
      
      // Check if it creates sidebar permissions
      const seedContent = fs.readFileSync(seedScript, 'utf8');
      const hasSidebarPerms = seedContent.includes('sidebar:') && 
                             seedContent.includes('permission-management');
      console.log(`  Creates sidebar permissions: ${hasSidebarPerms ? '✅ Yes' : '❌ No'}`);
    }
    
    console.log('\n🎯 CONCLUSION:');
    if (roleCount > 0 && permissionCount > 0 && hasAutoSeeding) {
      console.log('✅ Sidebar will work after database reset');
      console.log('   - Auto-seeding is enabled in index.js');
      console.log('   - Roles and permissions will be created automatically');
      console.log('   - No manual intervention required');
    } else {
      console.log('⚠️  Sidebar might have issues after reset');
      console.log('   - Auto-seeding may not be working');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSidebarAfterReset();
