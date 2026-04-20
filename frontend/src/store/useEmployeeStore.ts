import { create } from 'zustand';
import { employeeApi, ApiError } from '../api/employeeApi';
import type { Employee } from '../api/employeeApi';

interface EmployeeStore {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: (scope?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  // Initial state
  employees: [],
  loading: false,
  error: null,

  // Fetch employees from API
  fetchEmployees: async (scope?: string) => {
    const { loading } = get();
    
    // Prevent duplicate calls
    if (loading) {
      console.log('Already fetching employees, skipping...');
      return;
    }

    console.log('Fetching employees with scope:', scope || 'default');
    
    set({ loading: true, error: null });

    try {
      const res = await employeeApi.getEmployees(scope);
      console.log("API RESPONSE:", res);
      
      // Handle new API response format: { success: true, data: [...] }
      const employees = res.data || [];
      console.log('Employees fetched successfully:', employees.length);
      
      set({ 
        employees, 
        loading: false 
      });
    } catch (error: any) {
      console.error('Failed to fetch employees:', error);
      
      let errorMessage = 'Failed to fetch employees';
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        loading: false 
      });
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Reset store to initial state
  reset: () => {
    set({ 
      employees: [], 
      loading: false, 
      error: null 
    });
  },
}));

// Selectors for optimized re-renders
export const useEmployees = () => useEmployeeStore((state) => state.employees);
export const useEmployeesLoading = () => useEmployeeStore((state) => state.loading);
export const useEmployeesError = () => useEmployeeStore((state) => state.error);
export const useEmployeeActions = () => useEmployeeStore((state) => ({
  fetchEmployees: state.fetchEmployees,
  clearError: state.clearError,
  reset: state.reset,
}));
