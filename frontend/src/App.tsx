import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
import Profile from './components/Profile';
import EmployeeProfile from './components/EmployeeProfile';
import Settings from './components/Settings';
import PermissionManagement from './components/PermissionManagement';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalSearch from './components/GlobalSearch';
import { FilterProvider } from './contexts/FilterContext';
import { useAuthStore, useAuthInitialized, useIsAuthenticated } from './store/useAuthStore';
import './styles/globals.css';

function App() {
  const { initializeAuth } = useAuthStore();
  const authInitialized = useAuthInitialized();
  const isAuthenticated = useIsAuthenticated();

  // Initialize authentication on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
    <FilterProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <Sidebar />
        <Header />
        
        {/* Main Content Area */}
        <main className="ml-64 mt-16 px-6 py-6 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <ProtectedRoute>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/directory" element={<Directory />} />
                  <Route path="/command-center" element={<CommandCenter />} />
                  <Route path="/workflow-hub" element={<WorkflowHub />} />
                  <Route path="/timesheet-entry" element={<TimesheetEntry />} />
                  <Route path="/performance-goals" element={<PerformanceGoals />} />
                  <Route path="/my-team" element={<MyTeam />} />
                  <Route path="/leave-attendance" element={<LeaveAttendance />} />
                  <Route path="/payroll-benefits" element={<PayrollBenefits />} />
                  <Route path="/recruiting" element={<Recruiting />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/employee/:id" element={<EmployeeProfile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/permission-management" element={<PermissionManagement />} />
                  <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            </ErrorBoundary>
          </div>
        </main>
        <Toaster position="top-right" />
        
        {/* Global Command Palette */}
        <GlobalSearch />
      </div>
    </FilterProvider>
  );
}

export default App;