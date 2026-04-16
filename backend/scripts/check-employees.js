#!/usr/bin/env node

import prisma from '../lib/prisma.js';

async function checkEmployees() {
  try {
    const count = await prisma.employee.count();
    console.log(`\n📊 CURRENT APP - EMPLOYEE COUNT\n`);
    console.log(`Total Employees: ${count}\n`);

    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      },
      orderBy: { id: 'asc' }
    });

    console.log('Employee List:');
    console.log('─'.repeat(80));
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name.padEnd(20)} | ${emp.email.padEnd(30)} | ${emp.role.padEnd(10)} | ${emp.status}`);
    });
    console.log('─'.repeat(80));
    console.log(`\n✅ Total: ${count} employees\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkEmployees();
