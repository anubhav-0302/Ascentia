// Create SuperAdmin user
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

async function createSuperAdmin() {
  console.log('🔧 Creating SuperAdmin user...\n');
  
  try {
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await prisma.employee.findUnique({
      where: { email: 'superadmin@ascentia.com' }
    });
    
    if (existingSuperAdmin) {
      console.log('✅ SuperAdmin already exists');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Role: ${existingSuperAdmin.role}`);
      console.log(`   Organization ID: ${existingSuperAdmin.organizationId || 'None (Super Admin)'}`);
      return;
    }
    
    // Create SuperAdmin user
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    const superAdmin = await prisma.employee.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@ascentia.com',
        password: hashedPassword,
        role: 'superAdmin',
        jobTitle: 'Super Administrator',
        department: 'IT',
        location: 'Remote',
        status: 'active'
        // Super Admin not tied to any organization - organizationId omitted
      }
    });
    
    console.log('✅ SuperAdmin created successfully');
    console.log(`   Email: superadmin@ascentia.com`);
    console.log(`   Password: superadmin123`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Organization ID: ${superAdmin.organizationId || 'None (Super Admin)'}`);
    
  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
