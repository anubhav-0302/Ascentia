// Temporary test script to create a user directly via SQL
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function createTestUserDirectly() {
  try {
    console.log('🔍 Creating test user directly...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('✅ Password hashed');
    
    // Create user using raw SQL to bypass any potential issues
    const result = await prisma.$executeRaw`
      INSERT INTO "User" (name, email, password, role, "createdAt") 
      VALUES ('Admin User', 'admin@ascentia.com', ${hashedPassword}, 'admin', NOW())
      ON CONFLICT (email) DO NOTHING
    `;
    
    console.log('✅ User created/exists:', result);
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: 'admin@ascentia.com' }
    });
    
    console.log('✅ User verification:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUserDirectly();
