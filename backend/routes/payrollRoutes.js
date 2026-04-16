import express from 'express';
import { 
  getSalaryComponents, 
  createSalaryComponent, 
  updateSalaryComponent, 
  deleteSalaryComponent,
  getEmployeeSalaries,
  assignSalaryToEmployee,
  updateEmployeeSalary
} from '../payrollController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 PAYROLL ROUTE:", req.method, req.url);
  next();
});

// Salary Components - Admin/HR only
router.get('/salary-components', requireAuth, authorize('admin', 'hr'), getSalaryComponents);
router.post('/salary-components', requireAuth, authorize('admin', 'hr'), createSalaryComponent);
router.put('/salary-components/:id', requireAuth, authorize('admin', 'hr'), updateSalaryComponent);
router.delete('/salary-components/:id', requireAuth, authorize('admin', 'hr'), deleteSalaryComponent);

// Employee Salaries - Admin/HR can view all, employees see own
router.get('/employee-salaries', requireAuth, getEmployeeSalaries);
router.post('/employee-salaries', requireAuth, authorize('admin', 'hr'), assignSalaryToEmployee);
router.put('/employee-salaries/:id', requireAuth, authorize('admin', 'hr'), updateEmployeeSalary);

export default router;
