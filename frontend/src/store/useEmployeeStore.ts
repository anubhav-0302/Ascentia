import { create } from 'zustand';
import { employeeApi, ApiError } from '../api/employeeApi';
import type { Employee } from '../api/employeeApi';

interface EmployeeStore {
  // State
  employees: Employee[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEmployees: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  // Initial state
  employees: [],
  loading: false,
  error: null,

  // Fetch employees from API
  fetchEmployees: async () => {
    const { loading } = get();
    
    // Prevent duplicate calls
    if (loading) {
      console.log('Already fetching employees, skipping...');
      return;
    }

    console.log('Fetching employees...');
    
    set({ loading: true, error: null });

    try {
      const employees = await employeeApi.getEmployees();
      console.log('Employees fetched successfully:', employees.length);
      
      set({ 
        employees, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      
      let errorMessage = 'Failed to load employees';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ 
        employees: [], 
        loading: false, 
        error: errorMessage 
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
