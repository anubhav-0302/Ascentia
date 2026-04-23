// Update existing organizations with codes
import prisma from './lib/prisma.js';

async function updateOrgCodes() {
  console.log('🔧 Updating organization codes...\n');
  
  try {
    const orgs = await prisma.organization.findMany();
    
    for (const org of orgs) {
      if (!org.code) {
        // Generate a code from the name
        const code = org.name.toUpperCase().replace(/\s+/g, '-').substring(0, 20);
        
        await prisma.organization.update({
          where: { id: org.id },
          data: { code }
        });
        
        console.log(`✅ Updated ${org.name} with code: ${code}`);
      }
    }
    
    console.log('\n✅ All organizations updated with codes');
  } catch (error) {
    console.error('❌ Error updating organization codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOrgCodes();
