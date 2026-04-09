// In-memory employee store for testing dashboard functionality
let employees = [];

// Initialize with sample employees
const sampleEmployees = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@ascentia.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    location: 'New York',
    status: 'Active',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@ascentia.com',
    jobTitle: 'Product Manager',
    department: 'Product',
    location: 'San Francisco',
    status: 'Active',
    createdAt: new Date('2024-01-20')
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@ascentia.com',
    jobTitle: 'UX Designer',
    department: 'Design',
    location: 'Remote',
    status: 'Remote',
    createdAt: new Date('2024-02-01')
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@ascentia.com',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    location: 'London',
    status: 'Active',
    createdAt: new Date('2024-02-10')
  },
  {
    id: 5,
    name: 'Tom Brown',
    email: 'tom@ascentia.com',
    jobTitle: 'Marketing Manager',
    department: 'Marketing',
    location: 'New York',
    status: 'Onboarding',
    createdAt: new Date('2024-03-01')
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily@ascentia.com',
    jobTitle: 'Data Analyst',
    department: 'Analytics',
    location: 'Remote',
    status: 'Remote',
    createdAt: new Date('2024-03-05')
  },
  {
    id: 7,
    name: 'Chris Wilson',
    email: 'chris@ascentia.com',
    jobTitle: 'Backend Developer',
    department: 'Engineering',
    location: 'San Francisco',
    status: 'Active',
    createdAt: new Date('2024-03-10')
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    email: 'lisa@ascentia.com',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    location: 'New York',
    status: 'Active',
    createdAt: new Date('2024-03-15')
  }
];

// Initialize the store
employees = [...sampleEmployees];

console.log("✅ Sample employees created in memory store");
console.log("📊 TOTAL EMPLOYEES:", employees.length);

export const getEmployees = () => employees;
export const getEmployeeById = (id) => employees.find(e => e.id === id);
export const createEmployee = (employeeData) => {
  const newEmployee = {
    id: employees.length + 1,
    ...employeeData,
    createdAt: new Date()
  };
  employees.push(newEmployee);
  return newEmployee;
};
export const updateEmployee = (id, updateData) => {
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updateData };
    return employees[index];
  }
  return null;
};
export const deleteEmployee = (id) => {
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    return employees.splice(index, 1)[0];
  }
  return null;
};
