import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function for error handling
const handleError = (res, error, message = 'Internal server error') => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    message,
    error: error.message
  });
};

// Helper function for success response
const successResponse = (res, data, message = 'Success') => {
  res.json({
    success: true,
    message,
    data
  });
};

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Ascentia API running' });
});

// GET /api/employees - Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: 'asc' }
    });
    successResponse(res, employees, 'Employees retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to fetch employees');
  }
});

// GET /api/employees/:id - Get employee by ID
app.get('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    successResponse(res, employee, 'Employee retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to fetch employee');
  }
});

// POST /api/employees - Create new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, jobTitle, department, location, status } = req.body;

    // Validation
    if (!name || !email || !jobTitle || !department) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, email, jobTitle, department'
      });
    }

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    });

    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        jobTitle,
        department,
        location: location || '',
        status: status || 'Active'
      }
    });

    successResponse(res, employee, 'Employee created successfully');
  } catch (error) {
    handleError(res, error, 'Failed to create employee');
  }
});

// PUT /api/employees/:id - Update employee
app.put('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const { name, email, jobTitle, department, location, status } = req.body;

    // Validation
    if (!name || !email || !jobTitle || !department) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, email, jobTitle, department'
      });
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if email is taken by another employee
    const emailCheck = await prisma.employee.findFirst({
      where: {
        email,
        id: { not: id }
      }
    });

    if (emailCheck) {
      return res.status(400).json({
        success: false,
        message: 'Email is already used by another employee'
      });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        name,
        email,
        jobTitle,
        department,
        location: location || '',
        status: status || 'Active'
      }
    });

    successResponse(res, employee, 'Employee updated successfully');
  } catch (error) {
    handleError(res, error, 'Failed to update employee');
  }
});

// DELETE /api/employees/:id - Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await prisma.employee.delete({
      where: { id }
    });

    successResponse(res, { id }, 'Employee deleted successfully');
  } catch (error) {
    handleError(res, error, 'Failed to delete employee');
  }
});

// GET /api/dashboard/stats - Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Get total employees count
    const totalEmployees = await prisma.employee.count();

    // Get active employees count
    const activeEmployees = await prisma.employee.count({
      where: { status: 'Active' }
    });

    // Get remote employees count
    const remoteEmployees = await prisma.employee.count({
      where: { status: 'Remote' }
    });

    // Get unique departments count
    const departmentsResult = await prisma.employee.findMany({
      select: { department: true },
      distinct: ['department']
    });
    const departments = departmentsResult.length;

    // Get recent employees (last 5)
    const recentEmployees = await prisma.employee.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        jobTitle: true,
        status: true,
        createdAt: true
      }
    });

    const stats = {
      totalEmployees,
      activeEmployees,
      remoteEmployees,
      departments,
      recentEmployees
    };

    successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    handleError(res, error, 'Failed to fetch dashboard statistics');
  }
});

// Optional - keep old routes for compatibility
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(employees);
  } catch (error) {
    handleError(res, error, 'Failed to fetch employees');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ascentia API running on http://localhost:${PORT}`);
  console.log(`📊 Prisma database connected`);
});