import prisma from './lib/prisma.js';
import { logDatabaseOperation } from './databaseLogger.js';
import { tenantWhere, tenantWhereWith } from './helpers/tenantHelper.js';

// GET /api/payroll/salary-components - Get all salary components
const getSalaryComponents = async (req, res) => {
  try {
    const { type, category, status } = req.query;
    
    const whereClause = tenantWhere(req);
    
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    
    const components = await prisma.salaryComponent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        employeeSalaries: {
          select: { id: true }
        }
      }
    });
    
    // console.log(`📊 getSalaryComponents: ${components.length} components`);
    res.json({ success: true, data: components });
  } catch (error) {
    console.error("❌ GET SALARY COMPONENTS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch salary components", 
      error: error.message 
    });
  }
};

// POST /api/payroll/salary-components - Create new salary component
const createSalaryComponent = async (req, res) => {
  try {
    const { name, type, category, amount, isPercentage, isTaxable } = req.body;
    
    // console.log(`📝 Creating component: name=${name}, type=${type}, amount=${amount}, isPercentage=${isPercentage} (type: ${typeof isPercentage})`);
    
    if (!name || !type || !category || amount === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, type, category, and amount are required' 
      });
    }
    
    if (!['Earning', 'Deduction'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either "Earning" or "Deduction"' 
      });
    }
    
    if (amount < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount cannot be negative' 
      });
    }
    
    // Convert isPercentage to boolean (handle string values from form data)
    // Only treat as percentage if explicitly true
    const isPercentageBoolean = isPercentage === true || isPercentage === 'true' || isPercentage === 1 || isPercentage === '1';
    // console.log(`✓ isPercentageBoolean=${isPercentageBoolean}, amount=${amount}, raw isPercentage=${isPercentage}`);
    
    // Only validate percentage range if it's actually marked as percentage
    if (isPercentageBoolean === true && (amount < 0 || amount > 100)) {
      // console.log(`❌ Validation failed: percentage ${amount} is not between 0-100`);
      return res.status(400).json({ 
        success: false, 
        message: 'Percentage amount must be between 0 and 100' 
      });
    }
    
    const component = await prisma.salaryComponent.create({
      data: {
        name,
        type,
        category,
        amount: parseFloat(amount),
        isPercentage: Boolean(isPercentage),
        isTaxable: Boolean(isTaxable),
        organizationId: req.user.organizationId
      }
    });
    
    await logDatabaseOperation('CREATE', 'salary_component', component.id, req.user.id);
    
    // console.log(`✅ Created salary component: ${component.id}`);
    res.json({ success: true, data: component });
  } catch (error) {
    console.error("❌ CREATE SALARY COMPONENT ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create salary component", 
      error: error.message 
    });
  }
};

// PUT /api/payroll/salary-components/:id - Update salary component
const updateSalaryComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, category, amount, isPercentage, isTaxable, status } = req.body;
    
    const existingComponent = await prisma.salaryComponent.findFirst({
      where: { 
        id: parseInt(id),
        ...tenantWhere(req)
      }
    });
    
    if (!existingComponent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salary component not found' 
      });
    }
    
    // Only admins can update salary components
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update salary components' 
      });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) {
      if (!['Earning', 'Deduction'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Type must be either "Earning" or "Deduction"' 
        });
      }
      updateData.type = type;
    }
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Amount cannot be negative' 
        });
      }
      
      // Convert isPercentage to boolean (handle string values from form data)
      // Only treat as percentage if explicitly true
      const isPercentageBoolean = isPercentage === true || isPercentage === 'true' || isPercentage === 1 || isPercentage === '1';
      
      // Only validate percentage range if it's actually marked as percentage
      if (isPercentageBoolean === true && (amount < 0 || amount > 100)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Percentage amount must be between 0 and 100' 
        });
      }
      
      updateData.amount = parseFloat(amount);
    }
    if (isPercentage !== undefined) updateData.isPercentage = Boolean(isPercentage);
    if (isTaxable !== undefined) updateData.isTaxable = Boolean(isTaxable);
    if (status !== undefined) updateData.status = status;
    
    const component = await prisma.salaryComponent.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    await logDatabaseOperation('UPDATE', 'salary_component', component.id, req.user.id);
    
    // console.log(`✅ Updated salary component: ${component.id}`);
    res.json({ success: true, data: component });
  } catch (error) {
    console.error("❌ UPDATE SALARY COMPONENT ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update salary component", 
      error: error.message 
    });
  }
};

// DELETE /api/payroll/salary-components/:id - Delete salary component
const deleteSalaryComponent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingComponent = await prisma.salaryComponent.findFirst({
      where: { 
        id: parseInt(id),
        ...tenantWhere(req)
      },
      include: {
        employeeSalaries: {
          select: { id: true }
        }
      }
    });
    
    if (!existingComponent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salary component not found' 
      });
    }
    
    // Only admins can delete salary components
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete salary components' 
      });
    }
    
    // Check if component is being used by any employee
    if (existingComponent.employeeSalaries.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete salary component that is assigned to employees' 
      });
    }
    
    await prisma.salaryComponent.delete({
      where: { id: parseInt(id) }
    });
    
    await logDatabaseOperation('DELETE', 'salary_component', parseInt(id), req.user.id);
    
    // console.log(`✅ Deleted salary component: ${id}`);
    res.json({ success: true, message: 'Salary component deleted successfully' });
  } catch (error) {
    console.error("❌ DELETE SALARY COMPONENT ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete salary component", 
      error: error.message 
    });
  }
};

// GET /api/payroll/employee-salaries - Get employee salary structures
const getEmployeeSalaries = async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    
    // EmployeeSalary doesn't have organizationId, so we filter by employee's organization
    const whereClause = {};
    
    if (employeeId) whereClause.employeeId = parseInt(employeeId);
    if (status) whereClause.status = status;
    if (!['admin', 'hr'].includes(req.user.role)) {
      // Employees can only see their own salary structure
      whereClause.employeeId = req.user.id;
    }
    
    const salaries = await prisma.employeeSalary.findMany({
      where: whereClause,
      orderBy: { effectiveDate: 'desc' },
      include: {
        employee: {
          select: { id: true, name: true, email: true, department: true }
        },
        component: {
          select: { id: true, name: true, type: true, category: true, amount: true, isPercentage: true, isTaxable: true }
        }
      }
    });
    
    // console.log(`📊 getEmployeeSalaries: ${salaries.length} salary records`);
    res.json({ success: true, data: salaries });
  } catch (error) {
    console.error("❌ GET EMPLOYEE SALARIES ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch employee salaries", 
      error: error.message 
    });
  }
};

// POST /api/payroll/employee-salaries - Assign salary component to employee
const assignSalaryToEmployee = async (req, res) => {
  try {
    const { employeeId, componentId, amount, effectiveDate, endDate } = req.body;
    
    if (!employeeId || !componentId || amount === undefined || !effectiveDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID, component ID, amount, and effective date are required' 
      });
    }
    
    // Verify component exists
    const component = await prisma.salaryComponent.findFirst({
      where: { 
        id: parseInt(componentId),
        ...tenantWhere(req)
      }
    });
    
    if (!component) {
      return res.status(404).json({ 
        success: false, 
        message: 'Salary component not found' 
      });
    }
    
    // Verify employee exists
    const employee = await prisma.employee.findFirst({
      where: { 
        id: parseInt(employeeId),
        ...tenantWhere(req)
      }
    });
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    const salary = await prisma.employeeSalary.create({
      data: {
        employeeId: parseInt(employeeId),
        componentId: parseInt(componentId),
        amount: parseFloat(amount),
        effectiveDate: new Date(effectiveDate),
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        component: {
          select: { id: true, name: true, type: true, category: true }
        }
      }
    });
    
    await logDatabaseOperation('CREATE', 'employee_salary', salary.id, req.user.id);
    
    // console.log(`✅ Assigned salary to employee: ${salary.id}`);
    res.json({ success: true, data: salary });
  } catch (error) {
    console.error("❌ ASSIGN SALARY ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to assign salary to employee", 
      error: error.message 
    });
  }
};

// PUT /api/payroll/employee-salaries/:id - Update employee salary
const updateEmployeeSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, effectiveDate, endDate, status } = req.body;
    
    const existingSalary = await prisma.employeeSalary.findFirst({
      where: { 
        id: parseInt(id)
      }
    });
    
    if (!existingSalary) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee salary record not found' 
      });
    }
    
    // Only admins and HR can update employee salaries
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update employee salaries' 
      });
    }
    
    const updateData = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (effectiveDate !== undefined) updateData.effectiveDate = new Date(effectiveDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    
    const salary = await prisma.employeeSalary.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        component: {
          select: { id: true, name: true, type: true, category: true }
        }
      }
    });
    
    await logDatabaseOperation('UPDATE', 'employee_salary', salary.id, req.user.id);
    
    // console.log(`✅ Updated employee salary: ${salary.id}`);
    res.json({ success: true, data: salary });
  } catch (error) {
    console.error("❌ UPDATE EMPLOYEE SALARY ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update employee salary", 
      error: error.message 
    });
  }
};

export {
  getSalaryComponents,
  createSalaryComponent,
  updateSalaryComponent,
  deleteSalaryComponent,
  getEmployeeSalaries,
  assignSalaryToEmployee,
  updateEmployeeSalary
};
