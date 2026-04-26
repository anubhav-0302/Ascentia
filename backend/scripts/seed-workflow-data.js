import prisma from '../lib/prisma.js';

async function seedWorkflowData() {
  try {
    console.log("🌱 Seeding workflow, recruiting, and system metrics data...");
    
    // Get admin user
    const admin = await prisma.employee.findFirst({ where: { email: "admin@ascentia.com" } });
    
    if (!admin) {
      console.log("❌ Admin user not found. Please run seed-default-org.js first.");
      return;
    }
    
    // Seed Workflows
    console.log("📝 Creating workflows...");
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
        },
        {
          name: "Benefits Enrollment",
          description: "Annual benefits enrollment workflow",
          category: "Benefits",
          status: "draft",
          trigger: "scheduled",
          actions: 3,
          successRate: 0,
          createdBy: admin.id
        },
        {
          name: "Compliance Check",
          description: "Regular compliance monitoring",
          category: "Compliance",
          status: "active",
          trigger: "scheduled",
          actions: 4,
          lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
          successRate: 99.1,
          createdBy: admin.id
        }
      ]
    });
    
    // Seed Job Positions
    console.log("💼 Creating job positions...");
    await prisma.jobPosition.createMany({
      data: [
        {
          title: "Senior Frontend Developer",
          department: "Engineering",
          location: "San Francisco",
          type: "full-time",
          status: "open",
          priority: "high",
          description: "We're looking for an experienced frontend developer to join our team.",
          requirements: "5+ years React experience, TypeScript, Node.js",
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
        },
        {
          title: "UX Designer",
          department: "Design",
          location: "Remote",
          type: "contract",
          status: "open",
          priority: "medium",
          description: "Create beautiful and intuitive user experiences.",
          requirements: "3+ years UX design experience, Figma proficiency",
          createdBy: admin.id
        }
      ]
    });
    
    // Get positions for candidates
    const positions = await prisma.jobPosition.findMany();
    
    // Seed Candidates
    console.log("👥 Creating candidates...");
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
          positionId: positions[0].id,
          name: "Emily Johnson",
          email: "emily.j@email.com",
          phone: "+1-555-0102",
          stage: "screening",
          rating: 3,
          notes: "Good portfolio, needs technical assessment"
        },
        {
          positionId: positions[1].id,
          name: "Michael Brown",
          email: "michael.b@email.com",
          phone: "+1-555-0103",
          stage: "offer",
          rating: 5,
          notes: "Excellent leadership experience, strategic thinker"
        },
        {
          positionId: positions[2].id,
          name: "Sarah Davis",
          email: "sarah.d@email.com",
          phone: "+1-555-0104",
          stage: "applied",
          rating: null,
          notes: "Just applied, pending review"
        },
        {
          positionId: positions[1].id,
          name: "Robert Wilson",
          email: "robert.w@email.com",
          phone: "+1-555-0105",
          stage: "rejected",
          rating: 2,
          notes: "Lack of SaaS experience"
        }
      ]
    });
    
    // Seed System Metrics
    console.log("📊 Creating system metrics...");
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
          value: 4,
          change: "No change",
          recordedAt: new Date()
        },
        {
          metricType: "integrations",
          value: 2,
          change: "+1 this week",
          recordedAt: new Date()
        },
        {
          metricType: "api_calls",
          value: 1247,
          change: "+15% from last hour",
          recordedAt: new Date()
        }
      ]
    });
    
    // Seed Integrations
    console.log("🔗 Creating integrations...");
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
        },
        {
          name: "Zoom",
          type: "video",
          status: "inactive",
          configuredAt: null,
          lastSync: null
        }
      ]
    });
    
    console.log("✅ Workflow, recruiting, and system metrics data seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding workflow data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedWorkflowData();
