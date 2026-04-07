import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import CommandCenter from './components/CommandCenter';
import WorkflowHub from './components/WorkflowHub';
import MyTeam from './components/MyTeam';
import LeaveAttendance from './components/LeaveAttendance';
import PayrollBenefits from './components/PayrollBenefits';
import Recruiting from './components/Recruiting';
import Reports from './components/Reports';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // If not authenticated, show only login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // If authenticated, show main app with protected routes
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar />
      <Header />
      
      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/command-center" element={<CommandCenter />} />
              <Route path="/workflow-hub" element={<WorkflowHub />} />
              <Route path="/my-team" element={<MyTeam />} />
              <Route path="/leave-attendance" element={<LeaveAttendance />} />
              <Route path="/payroll-benefits" element={<PayrollBenefits />} />
              <Route path="/recruiting" element={<Recruiting />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
}

export default App;