import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';
import { logDatabaseOperation } from './databaseLogger.js';

// GET /api/employees - Get all employees from database
export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({ 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        department: true,
        location: true,
        status: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            directReports: true
          }
        }
      }
    });
    console.log(`📊 getEmployees: ${employees.length} employees from database`);
    res.json({ success: true, data: employees });
  } catch (error) {
    console.error("❌ GET EMPLOYEES ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch employees", error: error.message });
  }
};

// GET /api/employees/:id - Get single employee by ID
export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = parseInt(id);
    
    if (isNaN(employeeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid employee ID' 
      });
    }

    // Check if user is admin or requesting their own profile
    const isAdmin = req.user.role === 'admin';
    const isOwnProfile = req.user.id === employeeId;
    
    if (!isAdmin && !isOwnProfile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: You can only view your own profile or need admin privileges' 
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        jobTitle: true,
        department: true,
        location: true,
        status: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true
          }
        },
        directReports: {
          select: {
            id: true,
            name: true,
            email: true,
            jobTitle: true,
            department: true,
            status: true
          },
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    console.log(`📊 getEmployee: Found employee ${employee.name} (ID: ${employeeId})`);
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error("❌ GET EMPLOYEE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch employee", error: error.message });
  }
};

// POST /api/employees - Create new employee with optional authentication
export const createEmployee = async (req, res) => {
  try {
    console.log('🔍 Received request body:', req.body);
    const { name, email, jobTitle, department, location, status, role, password, managerId } = req.body;
    console.log('🔍 Extracted fields:', { name, email, jobTitle, department, location, status, role, password, managerId });

    if (!name || !email || !jobTitle || !department || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, job title, department, and role are required' 
      });
    }

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: { email }
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee with this email already exists' 
      });
    }

    // Validate managerId if provided
    if (managerId) {
      const manager = await prisma.employee.findUnique({ 
        where: { id: parseInt(managerId) } 
      });
      if (!manager) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid manager ID' 
        });
      }
    }

    // Generate default password if not provided
    let hashedPassword = null;
    let needsPasswordChange = false;
    
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Generate secure default password
      const defaultPassword = 'Default@123';
      hashedPassword = await bcrypt.hash(defaultPassword, 10);
      needsPasswordChange = true;
      
      console.log(`🔐 Generated default password for ${email}: ${defaultPassword}`);
    }

    const employee = await prisma.employee.create({
      data: { 
        name, 
        email, 
        jobTitle, 
        department, 
        location: location || 'Main Office', 
        status: status || 'active',
        role: role || 'employee',
        password: hashedPassword,
        managerId: managerId ? parseInt(managerId) : null,
        needsPasswordChange: needsPasswordChange
      }
    });

    // Log the operation
    await logDatabaseOperation('CREATE', 'employee', {
      employeeId: employee.id,
      email: employee.email,
      name: employee.name,
      hasPassword: !!password
    }, req.user?.id);

    console.log("✅ Employee created:", employee.id, employee.email, "Has password:", !!password);
    res.status(201).json({ 
      success: true, 
      message: 'Employee created successfully', 
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        jobTitle: employee.jobTitle,
        department: employee.department,
        location: employee.location,
        status: employee.status,
        role: employee.role,
        hasPassword: !!employee.password,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    console.error("❌ CREATE EMPLOYEE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to create employee", error: error.message });
  }
};

// PUT /api/employees/:id - Update employee
export const updateEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid employee ID' });

    const { name, email, jobTitle, department, location, status, role, password, managerId } = req.body;

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Employee not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (department) updateData.department = department;
    if (location) updateData.location = location;
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Handle managerId with validation
    if (managerId !== undefined) {
      // Prevent self-assignment
      if (parseInt(managerId) === id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Employee cannot be their own manager' 
        });
      }

      // Validate manager exists
      if (managerId) {
        const manager = await prisma.employee.findUnique({ 
          where: { id: parseInt(managerId) } 
        });
        if (!manager) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid manager ID' 
          });
        }
      }

      updateData.managerId = managerId ? parseInt(managerId) : null;
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData
    });

    console.log("✅ Employee updated:", updated.id, updated.email);
    res.json({ success: true, message: 'Employee updated successfully', data: updated });
  } catch (error) {
    console.error("❌ UPDATE EMPLOYEE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to update employee", error: error.message });
  }
};

// DELETE /api/employees/:id - Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid employee ID' });

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Employee not found' });

    await prisma.employee.delete({ where: { id } });

    console.log("✅ Employee deleted:", id);
    res.json({ success: true, message: 'Employee deleted successfully', data: existing });
  } catch (error) {
    console.error("❌ DELETE EMPLOYEE ERROR:", error.message);
    res.status(500).json({ success: false, message: 'Failed to delete employee', error: error.message });
  }
};
