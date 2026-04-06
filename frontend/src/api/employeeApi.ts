import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Employee interface
export interface Employee {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  status: string;
}

// API response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Custom API Error class
export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(
    message: string,
    status?: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create reusable API instance
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle the new response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const responseData = error.response.data as any;
      const message = responseData?.message || `HTTP error! status: ${error.response.status}`;
      throw new ApiError(message, error.response.status, responseData);
    } else if (error.request) {
      // Request was made but no response received
      throw new ApiError('Network error: Unable to connect to the server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw new ApiError(error.message || 'An unexpected error occurred');
    }
  }
);

// Employee API functions
export const employeeApi = {
  /**
   * Get all employees
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      const response: ApiResponse<Employee[]> = await api.get('/employees');
      if (response.success) {
        return response.data;
      }
      throw new ApiError(response.message || 'Failed to fetch employees');
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw error;
    }
  },

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const response: ApiResponse<Employee> = await api.get(`/employees/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new ApiError(response.message || 'Failed to fetch employee');
    } catch (error) {
      console.error(`Failed to fetch employee with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new employee
   */
  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const response: ApiResponse<Employee> = await api.post('/employees', employee);
      if (response.success) {
        return response.data;
      }
      throw new ApiError(response.message || 'Failed to create employee');
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
    try {
      const response: ApiResponse<Employee> = await api.put(`/employees/${id}`, employee);
      if (response.success) {
        return response.data;
      }
      throw new ApiError(response.message || 'Failed to update employee');
    } catch (error) {
      console.error(`Failed to update employee with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      const response: ApiResponse<{ id: number }> = await api.delete(`/employees/${id}`);
      if (!response.success) {
        throw new ApiError(response.message || 'Failed to delete employee');
      }
    } catch (error) {
      console.error(`Failed to delete employee with ID ${id}:`, error);
      throw error;
    }
  },
};

// Export default function for backward compatibility
export const getEmployees = employeeApi.getEmployees;
