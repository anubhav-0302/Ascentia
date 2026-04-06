// Employee API interface definitions
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
  data: T[];
  success: boolean;
  message?: string;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000';

// Error handling class
class ApiError extends Error {
  status?: number;
  data?: any;

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

// Generic fetch wrapper with error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error: Unable to connect to the server. Please check if the backend is running.');
    }
    
    // Handle other unexpected errors
    throw new ApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
  }
}

// Employee API functions
export const employeeApi = {
  /**
   * Get all employees from the backend
   * @returns Promise<Employee[]> - Array of employee objects
   */
  async getEmployees(): Promise<Employee[]> {
    try {
      const employees = await apiRequest<Employee[]>('/employees');
      return employees;
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      throw error;
    }
  },

  /**
   * Get employee by ID
   * @param id - Employee ID
   * @returns Promise<Employee> - Single employee object
   */
  async getEmployeeById(id: number): Promise<Employee> {
    try {
      const employee = await apiRequest<Employee>(`/employees/${id}`);
      return employee;
    } catch (error) {
      console.error(`Failed to fetch employee with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new employee
   * @param employee - Employee data to create
   * @returns Promise<Employee> - Created employee object
   */
  async createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const newEmployee = await apiRequest<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(employee),
      });
      return newEmployee;
    } catch (error) {
      console.error('Failed to create employee:', error);
      throw error;
    }
  },

  /**
   * Update an existing employee
   * @param id - Employee ID
   * @param employee - Updated employee data
   * @returns Promise<Employee> - Updated employee object
   */
  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee> {
    try {
      const updatedEmployee = await apiRequest<Employee>(`/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(employee),
      });
      return updatedEmployee;
    } catch (error) {
      console.error(`Failed to update employee with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an employee
   * @param id - Employee ID
   * @returns Promise<void>
   */
  async deleteEmployee(id: number): Promise<void> {
    try {
      await apiRequest<void>(`/employees/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete employee with ID ${id}:`, error);
      throw error;
    }
  },
};

// Export the main function for backward compatibility
export const getEmployees = employeeApi.getEmployees;

// Export API error class for error handling
export { ApiError };
