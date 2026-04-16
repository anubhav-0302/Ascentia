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
import { requireAuth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissions.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 PAYROLL ROUTE:", req.method, req.url);
  next();
});

// Salary Components - Use granular permissions
router.get('/salary-components', requireAuth, checkPermission('payroll', 'view'), getSalaryComponents);
router.post('/salary-components', requireAuth, checkPermission('payroll', 'create'), createSalaryComponent);
router.put('/salary-components/:id', requireAuth, checkPermission('payroll', 'edit'), updateSalaryComponent);
router.delete('/salary-components/:id', requireAuth, checkPermission('payroll', 'delete'), deleteSalaryComponent);

// Employee Salaries - Use granular permissions
router.get('/employee-salaries', requireAuth, checkPermission('payroll', 'view'), getEmployeeSalaries);
router.post('/employee-salaries', requireAuth, checkPermission('payroll', 'create'), assignSalaryToEmployee);
router.put('/employee-salaries/:id', requireAuth, checkPermission('payroll', 'edit'), updateEmployeeSalary);

export default router;
