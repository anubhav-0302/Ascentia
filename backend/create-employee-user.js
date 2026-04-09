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

async function createEmployeeUser() {
  try {
    // Check if employee user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'employee@ascentia.com' }
    });

    if (existingUser) {
      console.log('✅ Employee user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('employee123', 12);

    // Create employee user
    const user = await prisma.user.create({
      data: {
        name: 'Employee User',
        email: 'employee@ascentia.com',
        password: hashedPassword,
        role: 'employee'
      }
    });

    console.log('✅ Employee user created successfully!');
    console.log('📧 Email: employee@ascentia.com');
    console.log('🔑 Password: employee123');
    console.log('👤 Role: employee');
    console.log('🆔 User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating employee user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployeeUser();
