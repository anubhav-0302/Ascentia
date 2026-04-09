import { getEmployees as getAllEmployeesFromStore, createEmployee as createEmployeeInStore, updateEmployee as updateEmployeeInStore, deleteEmployee as deleteEmployeeFromStore } from './employeeStore.js';

// GET /api/employees - Get all employees
export const getEmployees = async (req, res) => {
  try {
    console.log("🔍 Fetching all employees...");
    const employees = getAllEmployeesFromStore();
    
    // Remove password from response
    const safeEmployees = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      jobTitle: emp.jobTitle,
      department: emp.department,
      location: emp.location,
      status: emp.status,
      createdAt: emp.createdAt
    }));
    
    res.json({
      success: true,
      data: safeEmployees
    });
  } catch (error) {
    console.error("❌ GET EMPLOYEES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message
    });
  }
};

// POST /api/employees - Create new employee
export const createEmployee = async (req, res) => {
  try {
    console.log("🔍 Creating employee:", req.body);
    const { name, email, jobTitle, department, location, status } = req.body;
    
    // Validation
    if (!name || !email || !jobTitle || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, job title, and department are required'
      });
    }
    
    // Check if employee already exists
    const existingEmployees = getAllEmployeesFromStore();
    const existingEmployee = existingEmployees.find(emp => emp.email === email);
    
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }
    
    const newEmployee = createEmployeeInStore({
      name,
      email,
      jobTitle,
      department,
      location: location || 'Main Office',
      status: status || 'Active'
    });
    
    console.log("✅ Employee created:", { id: newEmployee.id, email: newEmployee.email });
    
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    console.error("❌ CREATE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

// PUT /api/employees/:id - Update employee
export const updateEmployee = async (req, res) => {
  try {
    console.log("🔍 Updating employee:", req.params.id, req.body);
    const id = parseInt(req.params.id);
    const { name, email, jobTitle, department, location, status } = req.body;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }
    
    const updatedEmployee = updateEmployeeInStore(id, {
      name,
      email,
      jobTitle,
      department,
      location,
      status
    });
    
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    console.log("✅ Employee updated:", { id: updatedEmployee.id, email: updatedEmployee.email });
    
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error("❌ UPDATE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

// DELETE /api/employees/:id - Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    console.log("🔍 Deleting employee:", req.params.id);
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }
    
    const deletedEmployee = deleteEmployeeFromStore(id);
    
    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    console.log("✅ Employee deleted:", { id: deletedEmployee.id, email: deletedEmployee.email });
    
    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: deletedEmployee
    });
  } catch (error) {
    console.error("❌ DELETE EMPLOYEE ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};
