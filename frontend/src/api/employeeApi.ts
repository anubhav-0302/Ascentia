import { apiClient } from "./apiClient";

// Employee interface
export interface Employee {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  status: string;
  avatar?: string;
  createdAt?: string;
}

// Explicit type definitions for better TypeScript compatibility
export interface CreateEmployeeRequest {
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  status: string;
  avatar?: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: string;
  avatar?: string;
}

// API Error class for better error handling
export class ApiError extends Error {
  public status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Centralized employee API using apiClient
export const employeeApi = {
  getEmployees: () => apiClient.get("/employees"),
  
  createEmployee: (data: CreateEmployeeRequest) => apiClient.post("/employees", data),
  
  updateEmployee: (id: number, data: UpdateEmployeeRequest) => 
    apiClient.put(`/employees/${id}`, data),
  
  deleteEmployee: (id: number) => apiClient.delete(`/employees/${id}`),
};

// Legacy exports for backward compatibility
export const api = apiClient;
export const getEmployees = employeeApi.getEmployees;
