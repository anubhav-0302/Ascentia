import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Clear existing data (optional - comment out if you want to preserve existing data)
  await prisma.employee.deleteMany();
  
  await prisma.employee.createMany({
    data: [
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
      },
      {
        name: "David Wilson",
        email: "david.wilson@ascentia.com",
        jobTitle: "HR Manager",
        department: "HR",
        location: "Chicago",
        status: "Onboarding"
      },
      {
        name: "Jessica Martinez",
        email: "jessica.martinez@ascentia.com",
        jobTitle: "Marketing Lead",
        department: "Marketing",
        location: "Los Angeles",
        status: "Active"
      },
      {
        name: "Robert Brown",
        email: "robert.brown@ascentia.com",
        jobTitle: "DevOps Engineer",
        department: "Engineering",
        location: "Seattle",
        status: "Active"
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@ascentia.com",
        jobTitle: "Sales Manager",
        department: "Sales",
        location: "Boston",
        status: "Active"
      },
      {
        name: "James Taylor",
        email: "james.taylor@ascentia.com",
        jobTitle: "Data Analyst",
        department: "Analytics",
        location: "Miami",
        status: "Remote"
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@ascentia.com",
        jobTitle: "Frontend Developer",
        department: "Engineering",
        location: "San Francisco",
        status: "Active"
      },
      {
        name: "Thomas Lee",
        email: "thomas.lee@ascentia.com",
        jobTitle: "Finance Manager",
        department: "Finance",
        location: "New York",
        status: "Active"
      },
      {
        name: "Jennifer White",
        email: "jennifer.white@ascentia.com",
        jobTitle: "Backend Developer",
        department: "Engineering",
        location: "Austin",
        status: "Active"
      },
      {
        name: "Daniel Kim",
        email: "daniel.kim@ascentia.com",
        jobTitle: "QA Engineer",
        department: "Engineering",
        location: "Portland",
        status: "Onboarding"
      },
      {
        name: "Amanda Johnson",
        email: "amanda.johnson@ascentia.com",
        jobTitle: "Recruiter",
        department: "HR",
        location: "Chicago",
        status: "Active"
      },
      {
        name: "Christopher Moore",
        email: "christopher.moore@ascentia.com",
        jobTitle: "Business Analyst",
        department: "Product",
        location: "Denver",
        status: "Remote"
      },
      {
        name: "Rachel Green",
        email: "rachel.green@ascentia.com",
        jobTitle: "Content Writer",
        department: "Marketing",
        location: "Los Angeles",
        status: "Active"
      },
      {
        name: "Kevin Zhang",
        email: "kevin.zhang@ascentia.com",
        jobTitle: "Mobile Developer",
        department: "Engineering",
        location: "San Francisco",
        status: "Active"
      },
      {
        name: "Sophie Turner",
        email: "sophie.turner@ascentia.com",
        jobTitle: "UI Designer",
        department: "Design",
        location: "Remote",
        status: "Remote"
      },
      {
        name: "Ryan Murphy",
        email: "ryan.murphy@ascentia.com",
        jobTitle: "Sales Representative",
        department: "Sales",
        location: "Boston",
        status: "Active"
      },
      {
        name: "Olivia Wang",
        email: "olivia.wang@ascentia.com",
        jobTitle: "Product Designer",
        department: "Design",
        location: "New York",
        status: "Active"
      },
      {
        name: "Nathan Clark",
        email: "nathan.clark@ascentia.com",
        jobTitle: "Security Engineer",
        department: "Engineering",
        location: "Seattle",
        status: "Onboarding"
      }
    ],
    skipDuplicates: true
  });

  console.log("✅ Seed data inserted successfully!");
  console.log(`📊 Created ${await prisma.employee.count()} employees`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
