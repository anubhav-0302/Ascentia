import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated, useAuthLoading, useAuthInitialized, useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[]; // e.g., ['admin', 'manager']
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const authInitialized = useAuthInitialized();
  const { user } = useAuthStore();

  // Show loading spinner while checking authentication
  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-400">
            {!authInitialized ? 'Initializing authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if requiredRoles is specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user?.role?.toLowerCase() || 'employee';
    // Normalize requiredRoles to lowercase for comparison
    const normalizedRequiredRoles = requiredRoles.map(role => role.toLowerCase());
    if (!normalizedRequiredRoles.includes(userRole)) {
      // User doesn't have required role - redirect appropriately
      if (userRole === 'superadmin') {
        return <Navigate to="/superadmin" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
