import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// Auth store interface
interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// API base URL
const API_BASE = 'http://localhost:5000/api';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
          }

          // Set auth state
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('Login successful:', data.data.user);
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      // Register action
      register: async (name: string, email: string, password: string) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Registration failed');
          }

          // Set auth state
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('Registration successful:', data.data.user);
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        console.log('User logged out');
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  clearError: state.clearError,
  setLoading: state.setLoading,
}));
