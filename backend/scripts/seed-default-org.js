import prisma from '../lib/prisma.js';

async function seedDefaultOrganization() {
  try {
    // Check if default organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: { name: 'Ascentia Default Organization' }
    });

    if (!existingOrg) {
      // Create default organization
      const defaultOrg = await prisma.organization.create({
        data: {
          name: 'Ascentia Default Organization',
          subscriptionPlan: 'free',
          isActive: true
        }
      });

      console.log('✅ Default organization created:', defaultOrg);
    } else {
      console.log('✅ Default organization already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding default organization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDefaultOrganization();
