import express from 'express';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../employeeController.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 EMPLOYEE ROUTE:", req.method, req.url);
  next();
});

// GET /api/employees - Get all employees
router.get('/', getEmployees);

// POST /api/employees - Create new employee (admin only)
router.post('/', authorize('admin'), createEmployee);

// PUT /api/employees/:id - Update employee (admin only)
router.put('/:id', authorize('admin'), updateEmployee);

// DELETE /api/employees/:id - Delete employee (admin only)
router.delete('/:id', authorize('admin'), deleteEmployee);

export default router;
