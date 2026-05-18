import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, type DashboardStats } from "../api/dashboardApi";
import { getMyLeaves } from "../api/leaveApi";
import { useFilters } from "../contexts/FilterContext";
import { useIsAdmin, useAuthStore } from "../store/useAuthStore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import SkeletonLoader, { CardSkeleton, ChartSkeleton, TableSkeleton } from "./SkeletonLoader";
import LayoutWrapper from './LayoutWrapper';
import Button from "./Button";
import StatusBadge from "./StatusBadge";

// Chart color schemes
const DEPARTMENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const LEAVE_STATUS_COLORS = {
  Approved: '#10B981',
  Pending: '#F59E0B',
  Rejected: '#EF4444'
};
const TREND_COLORS = {
  approved: '#10B981',
  pending: '#F59E0B',
  rejected: '#EF4444'
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateFilters } = useFilters();
  const { user } = useAuthStore();
  const userRole = user?.role?.toLowerCase() || 'employee';
  const isAdmin = useIsAdmin();
  const isManager = userRole === 'manager';
  const isHR = userRole === 'hr';
  const isTeamLead = userRole === 'teamlead';

  // Calculate leave balance using useMemo - prefer backend data, fall back to local calculation
  const leaveBalance = useMemo(() => {
    if (stats?.leaveBalance != null) return stats.leaveBalance;
    const totalLeaveDays = stats?.totalLeaveDays || 21;
    const usedLeaveDays = myLeaves
      .filter(l => l.status === 'Approved' || l.status === 'Pending')
      .reduce((acc, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);
    return Math.max(0, totalLeaveDays - usedLeaveDays);
  }, [stats?.leaveBalance, stats?.totalLeaveDays, myLeaves]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
      
      // Fetch personal leave data for employees, team leads, and managers
      if (!isAdmin && !isHR) {
        const leavesData = await getMyLeaves();
        setMyLeaves(leavesData.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRetry = () => {
    fetchStats();
  };

  // Navigation handlers with filter propagation
  const handleNavigateToDirectory = (filterType?: string) => {
    switch (filterType) {
      case 'total-employees':
        updateFilters({ search: '', department: 'all', status: 'all' });
        break;
      case 'active-employees':
        updateFilters({ search: '', department: 'all', status: 'Active' });
        break;
      case 'departments':
        updateFilters({ search: '', department: 'all', status: 'all', sortBy: 'department' });
        break;
      case 'remote-workers':
        updateFilters({ search: '', department: 'all', status: 'Remote' });
        break;
      default:
        updateFilters({ search: '', department: 'all', status: 'all' });
    }
  };

  const handleNavigateToMyTeam = () => {
    updateFilters({ search: '', department: 'all', status: 'Active' });
  };

  const handleNavigateToLeaveAttendance = (filterType?: string) => {
    switch (filterType) {
      case 'leave-status':
        updateFilters({ search: '', status: 'all', dateRange: 'last-30-days' });
        break;
      case 'leave-trends':
        updateFilters({ search: '', reportType: 'attendance', dateRange: 'last-3-months' });
        break;
      default:
        updateFilters({ search: '', status: 'all' });
    }
  };

  const handleNavigateToReports = () => {
    updateFilters({ search: '', reportType: 'all', status: 'all', dateRange: 'last-30-days' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        {/* Header */}
        <div className="mb-8">
          <SkeletonLoader height={36} width={200} className="mb-2" />
          <SkeletonLoader height={20} width={400} />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Recent Employees Skeleton */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <SkeletonLoader height={28} width={200} />
            <SkeletonLoader height={16} width={120} />
          </div>
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto page-transition">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md animate-scaleIn">
            <div className="text-red-400 text-4xl mb-4 animate-pulse-slow">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={handleRetry}
              className="mx-auto"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LayoutWrapper className="page-transition">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isAdmin ? 'Admin Dashboard' : isManager ? 'Manager Dashboard' : isHR ? 'HR Dashboard' : isTeamLead ? 'Team Lead Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-gray-400">
          {isAdmin 
            ? 'System overview and organization-wide metrics'
            : isManager
            ? 'Team performance and management overview'
            : isHR
            ? 'HR operations and employee management metrics'
            : isTeamLead
            ? 'Team lead management and direct reports overview'
            : 'Your personal information and leave summary'
          }
        </p>
      </div>

      {/* Stats Cards - Role-Based View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* ADMIN VIEW - Full Organization Metrics */}
        {isAdmin && (
          <>
            <Link 
              to="/directory"
              onClick={() => handleNavigateToDirectory('total-employees')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-teal-500/40 hover:shadow-teal-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                  <i className="fas fa-users text-blue-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">{stats?.totalEmployees || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Total Employees</p>
              <div className="mt-4 flex items-center text-xs text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Directory</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link 
              to="/directory"
              onClick={() => handleNavigateToDirectory('active-employees')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-green-500/40 hover:shadow-green-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                  <i className="fas fa-user-check text-green-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Active</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-green-100 transition-colors duration-300">{stats?.activeEmployees || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Active Employees</p>
              <div className="mt-4 flex items-center text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Active</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link 
              to="/directory"
              onClick={() => handleNavigateToDirectory('remote-workers')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-home text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Remote</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.remoteEmployees || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Remote Workers</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Remote</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/directory"
              onClick={() => handleNavigateToDirectory('departments')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-orange-500/40 hover:shadow-orange-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors duration-300">
                  <i className="fas fa-building text-orange-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Org</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">{stats?.departments || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Departments</p>
              <div className="mt-4 flex items-center text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Directory</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>
          </>
        )}

        {/* MANAGER VIEW - Team Focused Metrics */}
        {isManager && (
          <>
            <Link 
              to="/my-team"
              onClick={() => handleNavigateToMyTeam()}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-green-500/40 hover:shadow-green-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                  <i className="fas fa-users text-green-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Team</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-green-100 transition-colors duration-300">{stats?.activeEmployees || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Team Members</p>
              <div className="mt-4 flex items-center text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Team</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/leave-attendance?tab=team"
              onClick={() => handleNavigateToLeaveAttendance('leave-status')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                  <i className="fas fa-calendar text-blue-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">{stats?.leaveStatus?.find(l => l.status === 'Pending')?.count || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Leave Approvals</p>
              <div className="mt-4 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Review Requests</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/timesheet-entry?tab=approvals"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-clock text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.pendingTimesheetReviews || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Timesheet Reviews</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Review Timesheets</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/leave-attendance"
              onClick={() => handleNavigateToLeaveAttendance('leave-trends')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-orange-500/40 hover:shadow-orange-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors duration-300">
                  <i className="fas fa-clipboard-check text-orange-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Average</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">{stats?.teamAttendance != null ? `${stats.teamAttendance}%` : 'N/A'}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Team Attendance</p>
              <div className="mt-4 flex items-center text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Attendance</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>
          </>
        )}

        {/* HR VIEW - HR-Specific Metrics */}
        {isHR && (
          <>
            <Link 
              to="/directory"
              onClick={() => handleNavigateToDirectory('total-employees')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                  <i className="fas fa-users text-blue-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">{stats?.totalEmployees || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Total Employees</p>
              <div className="mt-4 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Directory</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/leave-attendance?tab=team"
              onClick={() => handleNavigateToLeaveAttendance('leave-status')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-yellow-500/40 hover:shadow-yellow-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors duration-300">
                  <i className="fas fa-calendar-times text-yellow-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-yellow-100 transition-colors duration-300">{stats?.leaveStatus?.find(l => l.status === 'Pending')?.count || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Leave Approvals</p>
              <div className="mt-4 flex items-center text-xs text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Review Requests</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/timesheet-entry?tab=approvals"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-clock text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.pendingTimesheetReviews || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Timesheet Reviews</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Review Timesheets</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link 
              to="/payroll-benefits"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-green-500/40 hover:shadow-green-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                  <i className="fas fa-money-check-alt text-green-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">This</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-green-100 transition-colors duration-300">{stats?.payrollStatus || 'N/A'}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Payroll Status</p>
              <div className="mt-4 flex items-center text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Manage Payroll</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>
          </>
        )}

        {/* TEAM LEAD VIEW - Team & Project Focused Metrics */}
        {isTeamLead && (
          <>
            <Link 
              to="/my-team"
              onClick={() => handleNavigateToMyTeam()}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-green-500/40 hover:shadow-green-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                  <i className="fas fa-users text-green-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Team</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-green-100 transition-colors duration-300">{stats?.activeEmployees || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Team Members</p>
              <div className="mt-4 flex items-center text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Team</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/leave-attendance?tab=team"
              onClick={() => handleNavigateToLeaveAttendance('leave-status')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-yellow-500/40 hover:shadow-yellow-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors duration-300">
                  <i className="fas fa-calendar-times text-yellow-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-yellow-100 transition-colors duration-300">{stats?.leaveStatus?.find(l => l.status === 'Pending')?.count || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Leave Approvals</p>
              <div className="mt-4 flex items-center text-xs text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Review Requests</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/timesheet-entry?tab=approvals"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                  <i className="fas fa-clock text-blue-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Pending</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">{stats?.pendingTimesheetReviews || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Timesheet Reviews</p>
              <div className="mt-4 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Review Timesheets</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link 
              to="/leave-attendance"
              onClick={() => handleNavigateToLeaveAttendance('leave-trends')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-clipboard-check text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Average</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.teamAttendance != null ? `${stats.teamAttendance}%` : 'N/A'}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Team Attendance</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Attendance</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>
          </>
        )}

        {/* EMPLOYEE VIEW - Personal Focused Metrics */}
        {!isAdmin && !isManager && !isHR && !isTeamLead && (
          <>
            <Link
              to="/settings"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                  <i className="fas fa-user text-blue-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Status</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">{user?.name || 'Employee'}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Your Profile</p>
              <div className="mt-4 flex items-center text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Profile</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link 
              to="/leave-attendance"
              onClick={() => handleNavigateToLeaveAttendance('leave-status')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-green-500/40 hover:shadow-green-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                  <i className="fas fa-calendar-check text-green-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Available</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-green-100 transition-colors duration-300">
                {leaveBalance}
              </h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Leave Days Remaining</p>
              <div className="mt-4 flex items-center text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Request Leave</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/timesheet-entry"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-clock text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.hoursLogged || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Hours Logged</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Timesheet</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <Link
              to="/performance-goals"
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-orange-500/40 hover:shadow-orange-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors duration-300">
                  <i className="fas fa-chart-line text-orange-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Current</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">{stats?.performanceRating ? `${stats.performanceRating}/5` : 'N/A'}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Performance Rating</p>
              <div className="mt-4 flex items-center text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Reviews</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Your Tasks Section - Role-Based Actionable Tasks */}
      {stats?.pendingTasks && stats.pendingTasks.length > 0 && (
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-tasks text-teal-400 mr-2"></i>
            Your Tasks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.pendingTasks.map((task) => {
              const urgencyStyles = {
                overdue: 'border-red-500/30 bg-red-500/5 hover:border-red-500/50',
                pending: 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/50',
                info: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50'
              };
              const urgencyBadge = {
                overdue: 'bg-red-500/20 text-red-400',
                pending: 'bg-yellow-500/20 text-yellow-400',
                info: 'bg-blue-500/20 text-blue-400'
              };
              const urgencyLabel = {
                overdue: 'Action Required',
                pending: 'Pending',
                info: 'Info'
              };
              return (
                <Link
                  key={task.id}
                  to={task.link}
                  className={`block p-4 rounded-xl border ${urgencyStyles[task.urgency]} transition-all duration-200 hover:shadow-lg group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${urgencyBadge[task.urgency]}`}>
                        <i className={`fas ${task.icon} text-sm`}></i>
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm group-hover:text-teal-300 transition-colors">{task.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyBadge[task.urgency]}`}>{urgencyLabel[task.urgency]}</span>
                      </div>
                    </div>
                    {task.count > 0 && (
                      <span className={`text-lg font-bold ${task.urgency === 'overdue' ? 'text-red-400' : task.urgency === 'pending' ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {task.count}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{task.description}</p>
                  <div className="mt-3 flex items-center text-xs text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span>Take action</span>
                    <i className="fas fa-arrow-right ml-1.5"></i>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section - Role Based */}
      {(isAdmin || isHR) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Department Distribution Pie Chart */}
          <Link
            to="/directory"
            onClick={() => handleNavigateToDirectory('departments')}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
            style={{ animationDelay: '0.5s' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats?.departmentDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(stats?.departmentDistribution || []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Link>

          {/* Leave Status Bar Chart */}
          <Link
            to="/leave-attendance?tab=team"
            onClick={() => handleNavigateToLeaveAttendance('leave-status')}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
            style={{ animationDelay: '0.6s' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Organization Leave Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.leaveStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="status"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                >
                  {(stats?.leaveStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LEAVE_STATUS_COLORS[entry.status as keyof typeof LEAVE_STATUS_COLORS] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Link>

          {/* Leave Trends Line Chart */}
          <Link
            to="/reports"
            onClick={() => handleNavigateToReports()}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
            style={{ animationDelay: '0.7s' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Leave Trends (6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.leaveTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend
                  wrapperStyle={{ color: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke={TREND_COLORS.approved}
                  strokeWidth={2}
                  dot={{ fill: TREND_COLORS.approved, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke={TREND_COLORS.pending}
                  strokeWidth={2}
                  dot={{ fill: TREND_COLORS.pending, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke={TREND_COLORS.rejected}
                  strokeWidth={2}
                  dot={{ fill: TREND_COLORS.rejected, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Link>
        </div>
      )}

      {/* Manager/TeamLead Charts - Leave Status */}
      {(isManager || isTeamLead) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Link
            to="/leave-attendance?tab=team"
            onClick={() => handleNavigateToLeaveAttendance('leave-status')}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
            style={{ animationDelay: '0.5s' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Team Leave Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.leaveStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="status" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                  {(stats?.leaveStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LEAVE_STATUS_COLORS[entry.status as keyof typeof LEAVE_STATUS_COLORS] || '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Link>

          <Link
            to="/reports"
            onClick={() => handleNavigateToReports()}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
            style={{ animationDelay: '0.6s' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Leave Trends (6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.leaveTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="approved" stroke={TREND_COLORS.approved} strokeWidth={2} dot={{ fill: TREND_COLORS.approved, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="pending" stroke={TREND_COLORS.pending} strokeWidth={2} dot={{ fill: TREND_COLORS.pending, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="rejected" stroke={TREND_COLORS.rejected} strokeWidth={2} dot={{ fill: TREND_COLORS.rejected, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Link>
        </div>
      )}

      {/* Insights & Alerts Section - All Roles */}
      {(
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Insights & Alerts */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <i className="fas fa-lightbulb text-purple-400 mr-2"></i>
                Insights & Alerts
              </h3>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {/* Admin/HR see organization-wide insights */}
              {(isAdmin || isHR) && (
                <>
                  {stats?.payrollStatus && (
                    <div className="p-4 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-money-check-alt text-emerald-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Payroll Status</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            This month's payroll is <span className={stats.payrollStatus === 'Completed' ? 'text-green-400' : stats.payrollStatus === 'Pending' ? 'text-yellow-400' : 'text-gray-400'}>{stats.payrollStatus}</span>.
                          </p>
                          <Link to="/payroll-benefits" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            Manage Payroll →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats?.totalEmployees && (
                    <div className="p-4 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-chart-line text-blue-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Workforce Growth</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Organization has {stats.totalEmployees} employees{stats.activeEmployees ? ` (${stats.activeEmployees} active)` : ''}.
                          </p>
                          <Link to="/directory" onClick={() => handleNavigateToDirectory()} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            View Directory →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats?.departments && (
                    <div className="p-4 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-building text-indigo-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Department Overview</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            {stats.departments} department{stats.departments > 1 ? 's' : ''} across the organization.
                          </p>
                          <Link to="/directory" onClick={() => handleNavigateToDirectory('departments')} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            View Departments →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Manager/TeamLead sees team-specific insights */}
              {(isManager || isTeamLead) && (
                <>
                  {stats?.managedProjects && stats.managedProjects.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-project-diagram text-cyan-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Active Projects</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            You are managing {stats.managedProjects.length} active project{stats.managedProjects.length > 1 ? 's' : ''}.
                          </p>
                          <Link to="/project-management" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            View Projects →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}


                  {stats?.avgPerformance != null && (
                    <div className="p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-star text-green-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Team Performance</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Average team performance rating is {stats.avgPerformance.toFixed(1)}/5.0.
                          </p>
                          <Link to="/performance-goals" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats?.statusDistribution && stats.statusDistribution.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-users-cog text-indigo-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Team Status Distribution</h4>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {stats.statusDistribution.map((s) => (
                              <span key={s.name} className="text-xs text-gray-400">
                                <span className="text-white font-medium">{s.count}</span> {s.name}
                              </span>
                            ))}
                          </div>
                          <Link to="/directory" onClick={() => handleNavigateToMyTeam()} className="text-xs text-teal-400 hover:text-teal-300 transition-colors mt-1 inline-block">
                            View My Team →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Employee sees personal insights */}
              {!isAdmin && !isHR && !isManager && !isTeamLead && (
                <>
                  {stats?.performanceRating != null && (
                    <div className="p-4 bg-gradient-to-r from-orange-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-star text-orange-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Performance Rating</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Your current rating is <span className="text-white font-medium">{stats.performanceRating}/5</span>.
                          </p>
                          <Link to="/performance-goals" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                            View Goals →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-bell text-blue-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Timesheet Reminder</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          Submit your timesheet by end of day to ensure accurate payroll processing.
                        </p>
                        <Link to="/timesheet-entry" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                          Submit Timesheet →
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-heart text-green-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Wellness Tip</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          Remember to take regular breaks and maintain a healthy work-life balance.
                        </p>
                        <Link to="/settings" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                          View Settings →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {stats?.performanceRating == null && (
                    <div className="p-4 bg-gradient-to-r from-teal-500/5 to-transparent rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-check-circle text-teal-400 text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-1">Welcome!</h4>
                          <p className="text-gray-400 text-sm">Your insights will appear here as data becomes available.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Managed Projects Section - Manager/TeamLead */}
      {(isManager || isTeamLead) && stats?.managedProjects && stats.managedProjects.length > 0 && (
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-project-diagram text-blue-400 mr-2"></i>
            Your Projects
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.managedProjects.map((project) => (
              <div
                key={project.id}
                className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">{project.memberCount}</p>
                    <p className="text-gray-400 text-xs">Members</p>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">{project.taskCount}</p>
                    <p className="text-gray-400 text-xs">Tasks</p>
                  </div>
                  <div className="text-center p-2 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-teal-400">{project.completedTasks}</p>
                    <p className="text-gray-400 text-xs">Completed</p>
                  </div>
                </div>

                {/* Task Progress Bar */}
                {project.taskCount > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((project.completedTasks / project.taskCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(project.completedTasks / project.taskCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Project Members */}
                {project.members.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-xs font-medium mb-2">Team Members</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {project.members.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                              {member.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-gray-300">{member.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{member.role}</span>
                            {member.allocation && (
                              <span className="text-xs text-blue-400">{member.allocation}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {project.members.length > 5 && (
                        <p className="text-gray-500 text-xs">+{project.members.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority & Dates */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    project.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    project.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {project.priority}
                  </span>
                  {project.endDate && (
                    <span className="text-gray-500 text-xs">
                      Due: {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
};

export default Dashboard;