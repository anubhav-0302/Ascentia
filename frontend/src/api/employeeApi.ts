import { apiClient } from "./apiClient";

// Employee interface - unified model with authentication
export interface Employee {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  status: string;
  role: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  hasPassword?: boolean;
}

// Explicit type definitions for better TypeScript compatibility
export interface CreateEmployeeRequest {
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  status: string;
  role?: string;
  password?: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  status?: string;
  role?: string;
  password?: string;
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
  getEmployees: () => {
    console.log("🔍 Fetching employees...");
    return apiClient.get("/employees");
  },
  
  createEmployee: (data: CreateEmployeeRequest) => {
    console.log("🔍 Creating employee:", data);
    const result = apiClient.post("/employees", data);
    console.log("📤 Create employee request sent");
    return result;
  },
  
  updateEmployee: (id: number, data: UpdateEmployeeRequest) => {
    console.log("🔍 Updating employee:", id, data);
    const result = apiClient.put(`/employees/${id}`, data);
    console.log("📤 Update employee request sent");
    return result;
  },
  
  deleteEmployee: (id: number) => {
    console.log("🔍 Deleting employee:", id);
    const result = apiClient.delete(`/employees/${id}`);
    console.log("📤 Delete employee request sent");
    return result;
  },
};

// Legacy exports for backward compatibility
export const api = apiClient;
export const getEmployees = employeeApi.getEmployees;
