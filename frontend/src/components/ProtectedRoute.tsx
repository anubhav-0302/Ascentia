import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated, useAuthLoading, useAuthInitialized } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'employee';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const loading = useAuthLoading();
  const authInitialized = useAuthInitialized();

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

  // TODO: Add role-based checking when needed
  // For now, all authenticated users can access all routes

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
