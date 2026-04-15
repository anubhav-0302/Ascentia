import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Example employee data - replace with your actual employee data
const employees = [
  {
    name: 'Employee 1',
    email: 'emp1@ascentia.com',
    password: '123456',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    location: 'Remote',
    status: 'Active'
  },
  {
    name: 'Employee 2',
    email: 'emp2@ascentia.com',
    password: '123456',
    role: 'employee',
    department: 'HR',
    jobTitle: 'HR Specialist',
    location: 'Office',
    status: 'Active'
  },
  {
    name: 'Employee 3',
    email: 'emp3@ascentia.com',
    password: '123456',
    role: 'manager',
    department: 'Engineering',
    jobTitle: 'Engineering Manager',
    location: 'Hybrid',
    status: 'Active'
  },
  {
    name: 'Employee 4',
    email: 'emp4@ascentia.com',
    password: '123456',
    role: 'employee',
    department: 'Sales',
    jobTitle: 'Sales Representative',
    location: 'Remote',
    status: 'Active'
  },
  {
    name: 'Employee 5',
    email: 'emp5@ascentia.com',
    password: '123456',
    role: 'employee',
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    location: 'Office',
    status: 'Active'
  },
  {
    name: 'Employee 6',
    email: 'emp6@ascentia.com',
    password: '123456',
    role: 'employee',
    department: 'Finance',
    jobTitle: 'Financial Analyst',
    location: 'Hybrid',
    status: 'Active'
  }
];

async function restoreEmployees() {
  console.log('🔄 Restoring employees...');
  
  for (const emp of employees) {
    try {
      const hashedPassword = await bcrypt.hash(emp.password, 10);
      
      const employee = await prisma.employee.create({
        data: {
          ...emp,
          password: hashedPassword,
          settings: {
            language: 'English (US)',
            timezone: 'UTC-5 (Eastern)',
            dateFormat: 'MM/DD/YYYY',
            darkMode: true,
            compactView: false,
            emailNotifications: true,
            pushNotifications: true,
            weeklyDigest: false,
            projectUpdates: true,
            systemAlerts: true,
            profileVisibility: 'public',
            shareAnalytics: true,
            marketingEmails: false
          }
        }
      });
      
      console.log(`✅ Created: ${employee.name} (${employee.email})`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Already exists: ${emp.email}`);
      } else {
        console.error(`❌ Error creating ${emp.name}:`, error);
      }
    }
  }
  
  const totalEmployees = await prisma.employee.count();
  console.log(`\n📊 Total employees in database: ${totalEmployees}`);
  
  await prisma.$disconnect();
}

restoreEmployees();
