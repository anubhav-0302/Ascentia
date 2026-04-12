import prisma from './lib/prisma.js';

// GET /api/employees - Get all employees from database
export const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });
    console.log(`📊 getEmployees: ${employees.length} employees from database`);
    res.json({ success: true, data: employees });
  } catch (error) {
    console.error("❌ GET EMPLOYEES ERROR:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch employees", error: error.message });
  }
};

// POST /api/employees - Create new employee
export const createEmployee = async (req, res) => {
  try {
    const { name, email, jobTitle, department, location, status } = req.body;

    if (!name || !email || !jobTitle || !department)
      return res.status(400).json({ success: false, message: 'Name, email, job title, and department are required' });

    const employee = await prisma.employee.create({
      data: { name, email, jobTitle, department, location: location || 'Main Office', status: status || 'Active' }
    });

    console.log("✅ Employee created:", employee.id, employee.email);
    res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
  } catch (error) {
    console.error("❌ CREATE EMPLOYEE ERROR:", error.message);
    res.status(500).json({ success: false, message: 'Failed to create employee', error: error.message });
  }
};

// PUT /api/employees/:id - Update employee
export const updateEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid employee ID' });

    const { name, email, jobTitle, department, location, status } = req.body;

    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Employee not found' });

    const updated = await prisma.employee.update({
      where: { id },
      data: { name, email, jobTitle, department, location, status }
    });

    console.log("✅ Employee updated:", updated.id, updated.email);
    res.json({ success: true, message: 'Employee updated successfully', data: updated });
  } catch (error) {
    console.error("❌ UPDATE EMPLOYEE ERROR:", error.message);
    res.status(500).json({ success: false, message: 'Failed to update employee', error: error.message });
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
