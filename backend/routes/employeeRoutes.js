import express from 'express';
import { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../employeeController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 EMPLOYEE ROUTE:", req.method, req.url);
  next();
});

// GET /api/employees - Get all employees
router.get('/', requireAuth, checkPermission('employees', 'view'), getEmployees);

// GET /api/employees/:id - Get single employee (admin only or own profile)
router.get('/:id', requireAuth, getEmployee);

// POST /api/employees - Create new employee
router.post('/', requireAuth, checkPermission('employees', 'create'), createEmployee);

// PUT /api/employees/:id - Update employee
router.put('/:id', requireAuth, checkPermission('employees', 'edit'), updateEmployee);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', requireAuth, checkPermission('employees', 'delete'), deleteEmployee);

export default router;
