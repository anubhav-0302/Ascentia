// Create test employee user with properly hashed password
import bcrypt from "bcryptjs";
import { getUsers, createUser } from "./userStore.js";

async function createTestEmployee() {
  try {
    console.log("🔍 Creating test employee user...");
    
    // Check if employee user already exists
    const existingUsers = getUsers();
    const existingEmployee = existingUsers.find(u => u.email === 'employee@ascentia.com');
    
    if (existingEmployee) {
      console.log("✅ Employee user already exists:", existingEmployee.email);
      return existingEmployee;
    }
    
    // Hash the password
    const password = "123456";
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("🔍 Password hashed successfully");
    
    // Create the employee user
    const employee = await createUser({
      name: 'Employee User',
      email: 'employee@ascentia.com',
      password: hashedPassword,
      role: 'employee'
    });
    
    console.log("✅ Employee user created successfully:");
    console.log("  - Email:", employee.email);
    console.log("  - Role:", employee.role);
    console.log("  - Password:", password);
    console.log("  - ID:", employee.id);
    
    return employee;
  } catch (error) {
    console.error("❌ Error creating employee user:", error);
    throw error;
  }
}

// Run the script
createTestEmployee()
  .then((user) => {
    console.log("🎉 Test employee user is ready for login testing!");
    console.log("📋 Login credentials:");
    console.log("  Email: employee@ascentia.com");
    console.log("  Password: 123456");
  })
  .catch((error) => {
    console.error("💥 Failed to create test employee user:", error);
    process.exit(1);
  });
