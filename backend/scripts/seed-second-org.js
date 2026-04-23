import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Seed a second test organization with employees to enable
 * meaningful cross-org isolation testing.
 *
 * Run: node backend/scripts/seed-second-org.js
 */

async function seedSecondOrg() {
  try {
    const SECOND_ORG_NAME = 'Ascentia Test Org Two';
    const SECOND_ORG_CODE = 'TEST2';

    // Check if the second org already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { name: SECOND_ORG_NAME },
    });

    if (existingOrg) {
      console.log('✅ Second test organization already exists:', existingOrg);
      return;
    }

    // Create the second org
    const org = await prisma.organization.create({
      data: {
        name: SECOND_ORG_NAME,
        code: SECOND_ORG_CODE,
        subscriptionPlan: 'free',
        isActive: true,
      },
    });

    console.log('✅ Created second test org:', org);

    // Create 2 employees in this org: an admin and a regular employee.
    const passwordHash = await bcrypt.hash('TestUser123!', 10);

    const adminUser = await prisma.employee.create({
      data: {
        name: 'Test Admin Two',
        email: 'admin2@ascentia.com',
        password: passwordHash,
        role: 'admin',
        jobTitle: 'Test Admin',
        department: 'Engineering',
        status: 'active',
        organizationId: org.id,
      },
    });

    console.log('✅ Created test admin in second org:', adminUser);

    const employeeUser = await prisma.employee.create({
      data: {
        name: 'Test Employee Two',
        email: 'employee2@ascentia.com',
        password: passwordHash,
        role: 'employee',
        jobTitle: 'Test Engineer',
        department: 'Engineering',
        status: 'active',
        organizationId: org.id,
      },
    });

    console.log('✅ Created test employee in second org:', employeeUser);
    console.log(`\nYou can now log in as:`);
    console.log(`  admin2@ascentia.com / TestUser123!`);
    console.log(`  employee2@ascentia.com / TestUser123!`);
  } catch (error) {
    console.error('❌ Error seeding second org:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSecondOrg();
