// Temporary script to verify user existence in database
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkUsers() {
  try {
    console.log("🔍 Checking database connection...");
    
    // Check all users
    const users = await prisma.user.findMany();
    console.log("📊 USERS IN DATABASE:", users.length);
    
    if (users.length === 0) {
      console.log("❌ No users found in database");
      
      // Try to create a test user
      console.log("🔍 Creating test user...");
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@ascentia.com',
          password: hashedPassword,
          role: 'admin'
        }
      });
      
      console.log("✅ Test user created:", { id: newUser.id, email: newUser.email });
    } else {
      console.log("✅ Found users:");
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error("❌ DATABASE ERROR:", error);
    console.error("❌ ERROR STACK:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
