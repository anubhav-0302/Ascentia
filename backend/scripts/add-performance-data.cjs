const prisma = require('../lib/prisma.js').default;

async function addPerformanceData() {
  try {
    console.log('🌱 Adding performance data...');

    // Get the admin user and organization
    const admin = await prisma.employee.findFirst({
      where: { email: 'admin@ascentia.com' }
    });

    const organization = await prisma.organization.findFirst({
      where: { name: 'Ascentia Default Organization' }
    });

    if (!admin || !organization) {
      console.error('❌ Admin user or organization not found');
      console.log('Please run the main seed script first to create basic data');
      return;
    }

    // Check if performance cycle already exists
    const existingCycle = await prisma.performanceCycle.findFirst({
      where: { name: 'Q1 2024 Performance Review' }
    });

    if (existingCycle) {
      console.log('✅ Performance data already exists');
      return;
    }

    // Create a performance cycle
    const cycle = await prisma.performanceCycle.create({
      data: {
        name: 'Q1 2024 Performance Review',
        description: 'Quarterly performance review for Q1 2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'Active',
        organizationId: organization.id
      }
    });
    console.log(`✅ Created performance cycle: ${cycle.name}`);

    // Get some employees to assign goals to
    const employees = await prisma.employee.findMany({
      where: { 
        organizationId: organization.id,
        role: { in: ['employee', 'manager'] }
      },
      take: 5
    });

    if (employees.length === 0) {
      console.log('❌ No employees found to assign goals to');
      return;
    }

    // Create performance goals for each employee
    for (const employee of employees) {
      const goal = await prisma.performanceGoal.create({
        data: {
          cycleId: cycle.id,
          employeeId: employee.id,
          title: 'Improve Customer Satisfaction',
          description: 'Achieve a customer satisfaction score of 90% or higher through improved response times and quality of service.',
          targetDate: new Date('2024-03-31'),
          status: 'Active'
        }
      });
      console.log(`✅ Created goal for ${employee.name}: ${goal.title}`);

      // Create a self-review for each goal
      const selfReview = await prisma.performanceReview.create({
        data: {
          cycleId: cycle.id,
          goalId: goal.id,
          employeeId: employee.id,
          reviewerId: employee.id,
          type: 'Self',
          rating: 4,
          feedback: 'I have been working hard to improve customer satisfaction by responding to queries faster and ensuring quality service.',
          status: 'Submitted'
        }
      });
      console.log(`✅ Created self-review for ${employee.name}`);

      // Create a manager review if employee has a manager
      if (employee.managerId) {
        const managerReview = await prisma.performanceReview.create({
          data: {
            cycleId: cycle.id,
            goalId: goal.id,
            employeeId: employee.id,
            reviewerId: employee.managerId,
            type: 'Manager',
            rating: 4,
            feedback: 'Employee has shown significant improvement in customer interactions. Response times have improved by 30%.',
            status: 'Approved'
          }
        });
        console.log(`✅ Created manager review for ${employee.name}`);
      }

      // Add some KRAs to the goal
      await prisma.kRA.create({
        data: {
          goalId: goal.id,
          title: 'Response Time',
          description: 'Reduce average response time to customer queries',
          targetValue: '< 2 hours',
          actualValue: '1.5 hours',
          weightage: 0.4,
          status: 'Completed',
          dueDate: new Date('2024-03-15'),
          completedDate: new Date('2024-03-14')
        }
      });

      await prisma.kRA.create({
        data: {
          goalId: goal.id,
          title: 'Quality Score',
          description: 'Maintain quality score above 90%',
          targetValue: '> 90%',
          actualValue: '92%',
          weightage: 0.6,
          status: 'Completed',
          dueDate: new Date('2024-03-31'),
          completedDate: new Date('2024-03-30')
        }
      });

      console.log(`✅ Added KRAs for ${employee.name}'s goal`);
    }

    // Create a completed cycle for historical data
    const completedCycle = await prisma.performanceCycle.create({
      data: {
        name: 'Q4 2023 Performance Review',
        description: 'Quarterly performance review for Q4 2023',
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-12-31'),
        status: 'Completed',
        organizationId: organization.id
      }
    });
    console.log(`✅ Created completed cycle: ${completedCycle.name}`);

    // Add some completed goals to the completed cycle
    for (const employee of employees.slice(0, 3)) {
      const completedGoal = await prisma.performanceGoal.create({
        data: {
          cycleId: completedCycle.id,
          employeeId: employee.id,
          title: 'Complete Training Certification',
          description: 'Successfully complete the advanced customer service training certification.',
          targetDate: new Date('2023-12-15'),
          status: 'Completed'
        }
      });

      // Add completed reviews
      await prisma.performanceReview.create({
        data: {
          cycleId: completedCycle.id,
          goalId: completedGoal.id,
          employeeId: employee.id,
          reviewerId: employee.id,
          type: 'Self',
          rating: 5,
          feedback: 'Successfully completed the certification with excellent scores.',
          status: 'Approved'
        }
      });

      if (employee.managerId) {
        await prisma.performanceReview.create({
          data: {
            cycleId: completedCycle.id,
            goalId: completedGoal.id,
            employeeId: employee.id,
            reviewerId: employee.managerId,
            type: 'Manager',
            rating: 5,
            feedback: 'Outstanding performance. Employee exceeded expectations and is now mentoring others.',
            status: 'Approved'
          }
        });
      }
    }

    console.log('✅ Performance data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding performance data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
addPerformanceData();
