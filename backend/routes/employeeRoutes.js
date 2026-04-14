import express from 'express';
import { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../employeeController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 EMPLOYEE ROUTE:", req.method, req.url);
  next();
});

// GET /api/employees - Get all employees (admin only)
router.get('/', requireAuth, authorize('admin'), getEmployees);

// GET /api/employees/:id - Get single employee (admin only or own profile)
router.get('/:id', requireAuth, getEmployee);

// POST /api/employees - Create new employee (admin only)
router.post('/', requireAuth, authorize('admin'), createEmployee);

// PUT /api/employees/:id - Update employee (admin only)
router.put('/:id', requireAuth, authorize('admin'), updateEmployee);

// DELETE /api/employees/:id - Delete employee (admin only)
router.delete('/:id', requireAuth, authorize('admin'), deleteEmployee);

export default router;
