import { Routes, Route, Navigate } from 'react-router-dom';
import { Component, type ErrorInfo, type ReactNode, useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import CommandCenter from './components/CommandCenter';
import WorkflowHub from './components/WorkflowHub';
import TimesheetEntry from './components/TimesheetEntry';
import PerformanceGoals from './components/PerformanceGoals';
import MyTeam from './components/MyTeam';
import LeaveAttendance from './components/LeaveAttendance';
import PayrollBenefits from './components/PayrollBenefits';
import Recruiting from './components/Recruiting';
import Reports from './components/Reports';
import AuditLogs from './components/AuditLogs';
import EmployeeProfile from './components/EmployeeProfile';
import Settings from './components/Settings';
import PermissionManagement from './components/PermissionManagement';
import RoleManagementPage from './components/RoleManagementPage';
import OrganizationManagement from './components/OrganizationManagement';
import ProjectManagementPage from './components/ProjectManagementPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import OrgAdminsPage from './components/OrgAdminsPage';
import DataProtectionPage from './components/DataProtectionPage';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalSearch from './components/GlobalSearch';
import { FilterProvider } from './contexts/FilterContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CompactViewProvider } from './contexts/CompactViewContext';
import { useAuthStore, useAuthInitialized, useIsAuthenticated } from './store/useAuthStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useOrganizationStore } from './store/useOrganizationStore';
import './styles/globals.css';
import './styles/theme.css';

// Route-specific error boundary component
interface RouteErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  routeName?: string;
}

function RouteErrorBoundary({ children, fallback, routeName }: RouteErrorBoundaryProps) {
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate('/dashboard');
  };
  
  const defaultFallback = (
    <div className="min-h-96 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6 text-red-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          {routeName ? `Error in ${routeName}` : 'Page Error'}
        </h2>
        
        <p className="text-gray-400 text-sm mb-6">
          This page encountered an error. You can try again or go back to the dashboard.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all duration-200 active:scale-95"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </button>
          
          <button
            onClick={handleGoHome}
            className="inline-flex items-center px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium transition-all duration-200 active:scale-95"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </button>
        </div>

        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
              Error Details
            </summary>
            <pre className="mt-2 p-4 bg-slate-800 rounded-lg text-xs text-red-400 overflow-auto max-h-48">
              Error occurred in route: {routeName || 'Unknown'}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
  
  return (
    <ErrorBoundary fallback={fallback || defaultFallback}>
      {children}
    </ErrorBoundary>
  );
}

function App() {
  const { initializeAuth, token } = useAuthStore();
  const authInitialized = useAuthInitialized();
  const isAuthenticated = useIsAuthenticated();
  const { fetchSettings } = useSettingsStore();
  // Subscribe to the SuperAdmin's active org id. Used as a React `key` on the
  // Routes tree so switching orgs forces unmount+remount of every page, which
  // causes all `useEffect`-driven fetches to re-run with the new
  // X-Organization-Id header. For non-SuperAdmins this value stays null and
  // the key is stable, so nothing remounts.
  const currentOrgId = useOrganizationStore((s) => s.currentOrgId);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Load user settings after authentication is initialized and user is authenticated
  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      fetchSettings();
    }
  }, [authInitialized, isAuthenticated, fetchSettings]);

  // Show loading screen while auth is initializing
  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-400">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show only login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    );
  }

  // If authenticated, show main app with protected routes
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CompactViewProvider>
          <FilterProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
              <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
              <div className="lg:ml-64 flex flex-col min-h-screen">
                <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
              
              {/* Main Content Area */}
              <main className="mt-16 px-4 lg:px-6 py-4 lg:py-6 flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-full lg:max-w-7xl mx-auto pb-24">
                  <ProtectedRoute>
                    <Routes key={currentOrgId ?? 'platform'}>
                      <Route path="/" element={<HomeRedirect />} />
                      <Route path="/dashboard" element={<HomeRedirect />} />
                      <Route path="/directory" element={
                        <RouteErrorBoundary routeName="Directory">
                          <Directory />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/command-center" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <RouteErrorBoundary routeName="Command Center">
                            <CommandCenter />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/workflow-hub" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <RouteErrorBoundary routeName="Workflow Hub">
                            <WorkflowHub />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/timesheet-entry" element={
                        <RouteErrorBoundary routeName="Timesheet Entry">
                          <TimesheetEntry />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/performance-goals" element={
                        <RouteErrorBoundary routeName="Performance Goals">
                          <PerformanceGoals />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/my-team" element={
                        <RouteErrorBoundary routeName="My Team">
                          <MyTeam />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/leave-attendance" element={
                        <RouteErrorBoundary routeName="Leave & Attendance">
                          <LeaveAttendance />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/payroll-benefits" element={
                        <RouteErrorBoundary routeName="Payroll & Benefits">
                          <PayrollBenefits />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/recruiting" element={
                        <ProtectedRoute requiredRoles={['admin', 'hr']}>
                          <RouteErrorBoundary routeName="Recruiting">
                            <Recruiting />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/project-management" element={
                        <ProtectedRoute requiredRoles={['admin', 'hr']}>
                          <RouteErrorBoundary routeName="Project Management">
                            <ProjectManagementPage token={token} />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/reports" element={
                        <RouteErrorBoundary routeName="Reports">
                          <Reports />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/audit-logs" element={
                        <ProtectedRoute requiredRoles={['admin', 'hr']}>
                          <RouteErrorBoundary routeName="Audit Logs">
                            <AuditLogs />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <RouteErrorBoundary routeName="Profile">
                          <EmployeeProfile />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/employee/:id" element={
                        <RouteErrorBoundary routeName="Employee Profile">
                          <EmployeeProfile />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/settings" element={
                        <RouteErrorBoundary routeName="Settings">
                          <Settings />
                        </RouteErrorBoundary>
                      } />
                      <Route path="/permission-management" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <RouteErrorBoundary routeName="Permission Management">
                            <PermissionManagement />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/role-management" element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <RouteErrorBoundary routeName="Role Management">
                            <RoleManagementPage />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/organizations" element={
                        <ProtectedRoute requiredRoles={['superAdmin']}>
                          <RouteErrorBoundary routeName="Organization Management">
                            <OrganizationManagement token={token || ''} />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/superadmin" element={
                        <ProtectedRoute requiredRoles={['superAdmin']}>
                          <RouteErrorBoundary routeName="SuperAdmin Dashboard">
                            <SuperAdminDashboard />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/superadmin/admins" element={
                        <ProtectedRoute requiredRoles={['superAdmin']}>
                          <RouteErrorBoundary routeName="Organization Admins">
                            <OrgAdminsPage />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/data-protection" element={
                        <ProtectedRoute requiredRoles={['admin', 'superAdmin']}>
                          <RouteErrorBoundary routeName="Data Protection">
                            <DataProtectionPage />
                          </RouteErrorBoundary>
                        </ProtectedRoute>
                      } />
                      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </ProtectedRoute>
                </div>
              </main>
              
              {/* Footer - Always at bottom */}
              <footer className="hidden lg:block bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/50 py-3 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <span className="text-sm text-gray-400"> 2026 Ascentia. All rights reserved.</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="hover:text-teal-400 transition-colors cursor-pointer">Privacy</span>
                    <span className="hover:text-teal-400 transition-colors cursor-pointer">Terms</span>
                    <span className="hover:text-teal-400 transition-colors cursor-pointer">Support</span>
                  </div>
                </div>
              </footer>

              {/* Mobile Footer */}
              <footer className="lg:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/50 py-3 px-4 mt-auto">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <span className="text-sm text-gray-400"> 2026 Ascentia</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="hover:text-teal-400 transition-colors cursor-pointer">Privacy</span>
                    <span className="hover:text-teal-400 transition-colors cursor-pointer">Terms</span>
                    <span className="hover:text-teal-400 transition-colors cursor-pointer">Support</span>
                  </div>
                </div>
              </footer>
              </div>
              <Toaster position="top-right" />
              
              {/* Global Command Palette */}
              <GlobalSearch />
            </div>
          </FilterProvider>
        </CompactViewProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Route-level home redirect. SuperAdmin → Platform Dashboard; everyone else → employee Dashboard.
function HomeRedirect() {
  const { user } = useAuthStore();
  if (user?.role === 'superAdmin') {
    return <Navigate to="/superadmin" replace />;
  }
  return <Dashboard />;
}

export default App;
