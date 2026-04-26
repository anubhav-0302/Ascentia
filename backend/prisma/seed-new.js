import "dotenv/config";
import prisma from "../lib/prisma.js";

async function main() {
  console.log("🌱 Starting database seeding...");
  
  // Clear existing data
  await prisma.employee.deleteMany();
  console.log("🗑️  Cleared existing employee data");
  
  // Create employees
  await prisma.employee.createMany({
    data: [
      {
        name: "Admin User",
        email: "admin@ascentia.com",
        jobTitle: "System Administrator",
        department: "IT",
        location: "San Francisco",
        status: "Active",
        role: "admin",
        password: "$2a$10$K8ZpdrjwzUWSTmtyYoNb6ujN.kNc3RQHQ3p3qNIYFvXJhBczQ1kZ6" // admin123
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@ascentia.com",
        jobTitle: "Senior Developer",
        department: "Engineering",
        location: "San Francisco",
        status: "Active"
      },
      {
        name: "Michael Chen",
        email: "michael.chen@ascentia.com",
        jobTitle: "Product Manager",
        department: "Product",
        location: "New York",
        status: "Active"
      },
      {
        name: "Emily Davis",
        email: "emily.davis@ascentia.com",
        jobTitle: "UX Designer",
        department: "Design",
        location: "Remote",
        status: "Remote"
      }
    ]
  });
  
  console.log("✅ Created employees");
  console.log(`📊 Created ${await prisma.employee.count()} employees`);

  // Get admin user for createdBy fields
  const admin = await prisma.employee.findFirst({ where: { email: "admin@ascentia.com" } });
  
  if (admin) {
    // Seed Workflows
    await prisma.workflow.createMany({
      data: [
        {
          name: "Document Approval",
          description: "Multi-step document approval process",
          category: "Approval",
          status: "active",
          trigger: "manual",
          actions: 5,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          successRate: 98.5,
          createdBy: admin.id
        },
        {
          name: "Employee Offboarding",
          description: "Automated offboarding checklist",
          category: "HR Process",
          status: "active",
          trigger: "event",
          actions: 8,
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
          successRate: 95.2,
          createdBy: admin.id
        }
      ]
    });

    // Seed Job Positions
    await prisma.jobPosition.createMany({
      data: [
        {
          title: "Senior Frontend Developer",
          department: "Engineering",
          location: "San Francisco",
          type: "full-time",
          status: "open",
          priority: "high",
          description: "We're looking for an experienced frontend developer.",
          requirements: "5+ years React experience, TypeScript",
          createdBy: admin.id
        },
        {
          title: "Product Manager",
          department: "Product",
          location: "New York",
          type: "full-time",
          status: "open",
          priority: "high",
          description: "Lead product strategy for our core HRMS platform.",
          requirements: "5+ years PM experience, SaaS background",
          createdBy: admin.id
        }
      ]
    });

    // Get positions for candidates
    const positions = await prisma.jobPosition.findMany();
    
    // Seed Candidates
    await prisma.candidate.createMany({
      data: [
        {
          positionId: positions[0].id,
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1-555-0101",
          stage: "interview",
          rating: 4,
          notes: "Strong technical skills, good cultural fit"
        },
        {
          positionId: positions[1].id,
          name: "Michael Brown",
          email: "michael.b@email.com",
          phone: "+1-555-0103",
          stage: "offer",
          rating: 5,
          notes: "Excellent leadership experience"
        }
      ]
    });

    // Seed System Metrics
    await prisma.systemMetric.createMany({
      data: [
        {
          metricType: "alerts",
          value: 3,
          change: "+2 from yesterday",
          recordedAt: new Date()
        },
        {
          metricType: "workflows",
          value: 2,
          change: "No change",
          recordedAt: new Date()
        }
      ]
    });

    // Seed Integrations
    await prisma.integration.createMany({
      data: [
        {
          name: "Google Workspace",
          type: "email",
          status: "active",
          configuredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastSync: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          name: "Slack",
          type: "communication",
          status: "active",
          configuredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lastSync: new Date(Date.now() - 5 * 60 * 1000)
        }
      ]
    });
  }

  console.log("🎉 Database has been seeded successfully! 🌱");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
