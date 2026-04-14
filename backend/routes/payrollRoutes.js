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

const router = express.Router();

// Salary Components
router.get('/salary-components', getSalaryComponents);
router.post('/salary-components', createSalaryComponent);
router.put('/salary-components/:id', updateSalaryComponent);
router.delete('/salary-components/:id', deleteSalaryComponent);

// Employee Salaries
router.get('/employee-salaries', getEmployeeSalaries);
router.post('/employee-salaries', assignSalaryToEmployee);
router.put('/employee-salaries/:id', updateEmployeeSalary);

export default router;
