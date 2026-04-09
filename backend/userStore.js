// Simple in-memory user store for testing authentication without database issues
let users = [];

// Initialize with test users
const bcrypt = await import('bcryptjs');

// Create admin user
const adminHashedPassword = await bcrypt.hash('admin123', 10);
users.push({
  id: 1,
  name: 'Admin User',
  email: 'admin@ascentia.com',
  password: adminHashedPassword,
  role: 'admin',
  createdAt: new Date()
});

// Create employee user
const employeeHashedPassword = await bcrypt.hash('123456', 10);
users.push({
  id: 2,
  name: 'Employee User',
  email: 'employee@ascentia.com',
  password: employeeHashedPassword,
  role: 'employee',
  createdAt: new Date()
});

console.log("✅ Test users created in memory store");
console.log("📊 USERS:", users.map(u => ({ id: u.id, email: u.email, role: u.role })));
console.log("📋 Login credentials:");
console.log("  Admin - Email: admin@ascentia.com, Password: admin123");
console.log("  Employee - Email: employee@ascentia.com, Password: 123456");

export const getUsers = () => users;
export const findUserByEmail = (email) => users.find(u => u.email === email);
export const createUser = (userData) => {
  const newUser = {
    id: users.length + 1,
    ...userData,
    createdAt: new Date()
  };
  users.push(newUser);
  return newUser;
};
