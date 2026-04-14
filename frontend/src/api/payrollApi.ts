import { apiClient } from './apiClient';

export interface SalaryComponent {
  id: number;
  name: string;
  type: 'Earning' | 'Deduction';
  category: string;
  amount: number;
  isPercentage: boolean;
  isTaxable: boolean;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  employeeSalaries?: Array<{ id: number }>;
}

export interface EmployeeSalary {
  id: number;
  employeeId: number;
  componentId: number;
  amount: number;
  effectiveDate: string;
  endDate?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: number;
    name: string;
    email: string;
    department: string;
  };
  component?: {
    id: number;
    name: string;
    type: string;
    category: string;
    amount: number;
    isPercentage: boolean;
    isTaxable: boolean;
  };
}

export interface CreateSalaryComponentRequest {
  name: string;
  type: 'Earning' | 'Deduction';
  category: string;
  amount: number;
  isPercentage?: boolean;
  isTaxable?: boolean;
}

export interface UpdateSalaryComponentRequest {
  name?: string;
  type?: 'Earning' | 'Deduction';
  category?: string;
  amount?: number;
  isPercentage?: boolean;
  isTaxable?: boolean;
  status?: 'Active' | 'Inactive';
}

export interface AssignSalaryRequest {
  employeeId: number;
  componentId: number;
  amount: number;
  effectiveDate: string;
  endDate?: string;
}

export interface UpdateEmployeeSalaryRequest {
  amount?: number;
  effectiveDate?: string;
  endDate?: string;
  status?: 'Active' | 'Inactive';
}

// Salary Components
export const getSalaryComponents = async (params?: {
  type?: string;
  category?: string;
  status?: string;
}) => {
  const queryString = new URLSearchParams();
  if (params?.type) queryString.append('type', params.type);
  if (params?.category) queryString.append('category', params.category);
  if (params?.status) queryString.append('status', params.status);
  
  const url = queryString.toString() 
    ? `/payroll/salary-components?${queryString.toString()}`
    : '/payroll/salary-components';
  
  const response = await apiClient.get(url);
  return response.data;
};

export const createSalaryComponent = async (data: CreateSalaryComponentRequest) => {
  const response = await apiClient.post('/payroll/salary-components', data);
  return response.data;
};

export const updateSalaryComponent = async (id: number, data: UpdateSalaryComponentRequest) => {
  const response = await apiClient.put(`/payroll/salary-components/${id}`, data);
  return response.data;
};

export const deleteSalaryComponent = async (id: number) => {
  const response = await apiClient.delete(`/payroll/salary-components/${id}`);
  return response.data;
};

// Employee Salaries
export const getEmployeeSalaries = async (params?: {
  employeeId?: number;
  status?: string;
}) => {
  const queryString = new URLSearchParams();
  if (params?.employeeId) queryString.append('employeeId', params.employeeId.toString());
  if (params?.status) queryString.append('status', params.status);
  
  const url = queryString.toString() 
    ? `/payroll/employee-salaries?${queryString.toString()}`
    : '/payroll/employee-salaries';
  
  const response = await apiClient.get(url);
  return response.data;
};

export const assignSalaryToEmployee = async (data: AssignSalaryRequest) => {
  const response = await apiClient.post('/payroll/employee-salaries', data);
  return response.data;
};

export const updateEmployeeSalary = async (id: number, data: UpdateEmployeeSalaryRequest) => {
  const response = await apiClient.put(`/payroll/employee-salaries/${id}`, data);
  return response.data;
};
