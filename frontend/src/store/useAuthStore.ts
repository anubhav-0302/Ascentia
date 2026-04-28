import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearTokenCache } from '../api/apiClient';

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  phone?: string;
  address?: string;
  department?: string;
  jobTitle?: string;
  manager?: {
    id: number;
    name: string;
    role: string;
    department: string;
  };
  profilePicture?: string;
  twoFactorEnabled?: boolean;
  lastPasswordChange?: string;
  location?: string;
  status?: string;
}

// Auth store interface
interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  authInitialized: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
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
      authInitialized: false,
      error: null,

      // Initialize auth on app load
      initializeAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ authInitialized: true });
          return;
        }

        try {
          // Verify token by calling /api/auth/me
          const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({
                user: data.data.user,
                isAuthenticated: true,
                authInitialized: true,
              });
            } else {
              // Token invalid, clear auth
              get().logout();
            }
          } else {
            // Token invalid, clear auth
            get().logout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          // Clear auth on error
          get().logout();
        }
      },

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
          console.log('=== LOGIN DEBUG ===');
          console.log('Full response:', data);
          console.log('data.success:', data.success);
          console.log('data.data exists:', !!data.data);
          console.log('data.data.token exists:', !!(data.data && data.data.token));
          console.log('Token value:', data.data?.token);
          console.log('===================');

          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
          }

          // Set auth state
          set({
            user: data.data?.user,
            token: data.data?.token || null,
            isAuthenticated: true,
            loading: false,
            error: null,
            authInitialized: true,
          });

          console.log('Auth state set - token:', data.data?.token ? 'PRESENT' : 'NULL');
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || 'Login failed',
            authInitialized: true,
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
            authInitialized: true,
          });

          // console.log('Registration successful:', data.data.user);
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: error.message || 'Registration failed',
            authInitialized: true,
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        // Clear localStorage using centralized function
        clearTokenCache();
        
        // Reset all auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          authInitialized: true,
        });
        
        // console.log('User logged out - all auth state cleared');
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
export const useAuthInitialized = () => useAuthStore((state) => state.authInitialized);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  clearError: state.clearError,
  setLoading: state.setLoading,
  initializeAuth: state.initializeAuth,
}));

// Role-based hooks
export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'admin';
};

export const useIsManager = () => {
  const { user } = useAuthStore();
  return user?.role === 'manager';
};

export const useIsTeamLead = () => {
  const { user } = useAuthStore();
  return user?.role === 'teamlead';
};

export const useCanApproveLeave = () => {
  const user = useUser();
  return ['admin', 'hr', 'manager'].includes(user?.role || '');
};

export const useIsHR = () => {
  const { user } = useAuthStore();
  return user?.role === 'hr';
};

export const useIsManagerOrAdmin = () => {
  const { user } = useAuthStore();
  return user?.role === 'admin' || user?.role === 'manager';
};

export const useIsManagerOrTeamLeadOrAdmin = () => {
  const { user } = useAuthStore();
  return user?.role === 'admin' || user?.role === 'manager' || user?.role === 'teamlead';
};
