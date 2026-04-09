import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function createSampleLeaveRequests() {
  try {
    // Get users
    const users = await prisma.user.findMany();
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    // Clear existing leave requests
    await prisma.leaveRequest.deleteMany({});
    console.log('🗑️ Cleared existing leave requests');

    // Create sample leave requests
    const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave'];
    const statuses = ['Pending', 'Approved', 'Rejected'];
    const reasons = [
      'Family vacation',
      'Medical appointment',
      'Personal matters',
      'Child care',
      'Moving to new house',
      'Wedding ceremony',
      'Emergency surgery',
      'Mental health day'
    ];

    const leaveRequests = [];

    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      
      // Generate random dates within the next 3 months
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-15 days

      leaveRequests.push({
        userId: user.id,
        type,
        startDate,
        endDate,
        reason,
        status
      });
    }

    // Create leave requests in database
    const createdRequests = await prisma.leaveRequest.createMany({
      data: leaveRequests
    });

    console.log(`✅ Created ${createdRequests.count} sample leave requests`);

    // Show some examples
    const sampleRequests = await prisma.leaveRequest.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📋 Sample leave requests:');
    sampleRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.user.name} - ${req.type} (${req.status})`);
      console.log(`   ${req.startDate.toDateString()} to ${req.endDate.toDateString()}`);
      console.log(`   Reason: ${req.reason}\n`);
    });

  } catch (error) {
    console.error('❌ Error creating sample leave requests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleLeaveRequests();
