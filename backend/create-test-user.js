import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@ascentia.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create test admin user
    const user = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@ascentia.com',
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Test admin user created successfully!');
    console.log('📧 Email: admin@ascentia.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
