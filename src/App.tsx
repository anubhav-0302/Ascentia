import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Directory from './components/Directory';
import CommandCenter from './components/CommanCenter'; // Note: filename has typo
import WorkflowHub from './components/WorkflowHub';
import MyTeam from './components/MyTeam';
import LeaveAttendance from './components/LeaveAttendance';
import PayrollBenefits from './components/PayrollBenefits';
import Recruiting from './components/Recruiting';
import Reports from './components/Reports';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar />
      <Header />
      
      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/command-center" element={<CommandCenter />} />
            <Route path="/workflow-hub" element={<WorkflowHub />} />
            <Route path="/my-team" element={<MyTeam />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/leave-attendance" element={<LeaveAttendance />} />
            <Route path="/payroll-benefits" element={<PayrollBenefits />} />
            <Route path="/recruiting" element={<Recruiting />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;