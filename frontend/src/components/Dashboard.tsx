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
import ActivityFeed from "./ActivityFeed";
import LayoutWrapper from "./LayoutWrapper";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import AdvancedAnalytics from "./AdvancedAnalytics";

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
  const isAdmin = useIsAdmin();
  const { user } = useAuthStore();
  
  // Determine user role for dashboard customization
  const userRole = user?.role?.toLowerCase() || 'employee';
  const isManager = userRole === 'manager';
  const isHR = userRole === 'hr';

  // Calculate leave balance using useMemo to prevent recalculation on every render
  const leaveBalance = useMemo(() => {
    const totalLeaveDays = 21; // Standard annual leave
    const usedLeaveDays = myLeaves
      .filter(l => l.status === 'Approved' || l.status === 'Pending')
      .reduce((acc, leave) => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return acc + days;
      }, 0);
    return Math.max(0, totalLeaveDays - usedLeaveDays);
  }, [myLeaves]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
      
      // Fetch personal leave data for employees and HR users
      if (!isAdmin && !isManager) {
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
      case 'departments':
        updateFilters({ search: '', department: 'all', status: 'all', sortBy: 'department' });
        break;
      case 'remote-workers':
        updateFilters({ search: '', employmentType: 'remote', department: 'all', status: 'all' });
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
          {isAdmin ? 'Admin Dashboard' : isManager ? 'Manager Dashboard' : isHR ? 'HR Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-gray-400">
          {isAdmin 
            ? 'System overview and organization-wide metrics'
            : isManager
            ? 'Team performance and management overview'
            : isHR
            ? 'HR operations and employee management metrics'
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
              to="/my-team"
              onClick={() => handleNavigateToMyTeam()}
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
                <span>View Team</span>
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
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Departments</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">{stats?.departments || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Total Departments</p>
              <div className="mt-4 flex items-center text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Departments</span>
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

            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.2s' }}>
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
            </div>

            <Link 
              to="/leave-attendance"
              onClick={() => handleNavigateToLeaveAttendance('leave-status')}
              className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn cursor-pointer hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-chart-pie text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Status</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.teamAttendance || 0}%</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Team Attendance</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Attendance</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </Link>

            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn hover:border-orange-500/40 hover:shadow-orange-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors duration-300">
                  <i className="fas fa-star text-orange-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Avg</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">{stats?.avgPerformance || 'N/A'}/5</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Team Performance</p>
              <div className="mt-4 flex items-center text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Reviews</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </div>
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
              to="/leave-attendance"
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
              to="/timesheet-entry"
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

        {/* EMPLOYEE VIEW - Personal Focused Metrics */}
        {!isAdmin && !isManager && !isHR && (
          <>
            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
            </div>

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

            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn hover:border-purple-500/40 hover:shadow-purple-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                  <i className="fas fa-clock text-purple-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">This Month</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-purple-100 transition-colors duration-300">{stats?.hoursLogged || 0}</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Hours Logged</p>
              <div className="mt-4 flex items-center text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Timesheet</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 animate-fadeIn hover:border-orange-500/40 hover:shadow-orange-500/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors duration-300">
                  <i className="fas fa-chart-line text-orange-400 text-xl"></i>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">Current</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-orange-100 transition-colors duration-300">{stats?.performanceRating || 'N/A'}/5</h3>
              <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Performance Rating</p>
              <div className="mt-4 flex items-center text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>View Reviews</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Insights & Alerts Section - Role Based */}
      {(isAdmin || isHR || isManager) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Insights */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <i className="fas fa-brain text-purple-400 mr-2"></i>
                AI Insights
              </h3>
              <span className="text-xs text-gray-500">Updated 2 hours ago</span>
            </div>
            
            <div className="space-y-4">
              {/* Admin/HR see organization-wide insights */}
              {(isAdmin || isHR) && (
                <>
                  <div className="p-4 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-chart-line text-blue-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Employee Engagement Trend</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          Engagement scores have increased by 12% this month. The new remote work policy appears to be positively impacting team satisfaction.
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-green-400"><i className="fas fa-arrow-up mr-1"></i>12% vs last month</span>
                          <span className="text-gray-500">Based on 156 responses</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-users text-green-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Retention Risk Alert</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          3 employees in the Engineering department show signs of potential turnover based on recent activity patterns and engagement metrics.
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-yellow-400"><i className="fas fa-exclamation-triangle mr-1"></i>Medium priority</span>
                          <button 
                            onClick={() => {
                              alert('Opening retention management tools...\n\nThis would navigate to a detailed retention dashboard with employee engagement metrics, turnover risk analysis, and intervention strategies.');
                            }}
                            className="text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            Take Action →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-lightbulb text-yellow-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Skills Gap Analysis</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          Consider upskilling 5 team members in cloud technologies. Current demand exceeds available expertise by 40%.
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-blue-400"><i className="fas fa-graduation-cap mr-1"></i>Training opportunity</span>
                          <button 
                            onClick={() => {
                              alert('Opening training management system...\n\nThis would navigate to a training dashboard with skills gap analysis, course recommendations, and employee development plans.');
                            }}
                            className="text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Manager sees team-specific insights */}
              {isManager && (
                <>
                  <div className="p-4 bg-gradient-to-r from-blue-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-chart-line text-blue-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Team Performance Update</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          Your team's productivity increased by 8% this week. All project milestones are on track.
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-green-400"><i className="fas fa-arrow-up mr-1"></i>8% vs last week</span>
                          <span className="text-gray-500">Based on team metrics</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-500/5 to-transparent rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-calendar-check text-green-400 text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Leave Balance Alert</h4>
                        <p className="text-gray-400 text-sm mb-2">
                          2 team members have low leave balance remaining. Consider planning coverage for upcoming projects.
                        </p>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-yellow-400"><i className="fas fa-exclamation-triangle mr-1"></i>Needs attention</span>
                          <button 
                            onClick={() => {
                              alert('Opening team leave management...\n\nThis would show team leave balances and help plan coverage.');
                            }}
                            className="text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            View Team Leave →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <i className="fas fa-bolt text-yellow-400 mr-2"></i>
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              {isAdmin && (
                <Link 
                  to="/permission-management"
                  className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group block"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors duration-200">
                      <i className="fas fa-user-plus text-teal-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Add Employee</p>
                      <p className="text-gray-500 text-xs">Onboard new team member</p>
                    </div>
                  </div>
                </Link>
              )}
              {isHR && (
                <Link 
                  to="/directory"
                  className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group block"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors duration-200">
                      <i className="fas fa-user-tie text-indigo-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Manage Employees</p>
                      <p className="text-gray-500 text-xs">Update employee records</p>
                    </div>
                  </div>
                </Link>
              )}
              {(isAdmin || isHR || isManager) && (
                <Link 
                  to="/leave-attendance"
                  className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group block"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                      <i className="fas fa-calendar-plus text-blue-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Approve Leave</p>
                      <p className="text-gray-500 text-xs">{stats?.leaveStatus?.find(l => l.status === 'Pending')?.count || 0} pending requests</p>
                    </div>
                  </div>
                </Link>
              )}

              {(isAdmin || isHR) && (
                <button 
                  onClick={() => {
                    alert('Opening report generator...\n\nThis would navigate to a comprehensive report generation tool with customizable templates, data filters, and export options.');
                  }}
                  className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-200">
                      <i className="fas fa-chart-bar text-purple-400 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Generate Report</p>
                      <p className="text-gray-500 text-xs">Monthly analytics</p>
                    </div>
                  </div>
                </button>
              )}

              <button 
                onClick={() => {
                  alert('Opening announcement composer...\n\nThis would open a rich text editor for creating company-wide announcements with scheduling and targeting options.');
                }}
                className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group"
                disabled={!isAdmin}
                title={!isAdmin ? 'Only admins can send announcements' : 'Send announcement'}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    isAdmin 
                      ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                      : 'bg-gray-500/20 group-hover:bg-gray-500/20'
                  }`}>
                    <i className={`fas fa-bullhorn text-sm ${isAdmin ? 'text-green-400' : 'text-gray-400'}`}></i>
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${isAdmin ? 'text-white' : 'text-gray-500'}`}>Send Announcement</p>
                    <p className="text-gray-500 text-xs">{isAdmin ? 'Company-wide notice' : 'Admin only'}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section - Role Based */}
      {(isAdmin || isHR || isManager) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Department Distribution Pie Chart - Admin/HR only */}
          {(isAdmin || isHR) && (
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
          )}

          {/* Leave Status Bar Chart - All roles except Employee */}
          <Link 
            to="/leave-attendance"
            onClick={() => handleNavigateToLeaveAttendance('leave-status')}
            className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
            style={{ animationDelay: '0.6s' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {isAdmin || isHR ? 'Organization Leave Status' : 'Team Leave Status'}
            </h3>
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

          {/* Leave Trends Line Chart - Admin/HR only */}
          {(isAdmin || isHR) && (
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
          )}
        </div>
      )}

      {/* Recent Employees - Admin/HR only */}
      {(isAdmin || isHR) && (
        <Link 
          to="/directory"
          onClick={() => handleNavigateToDirectory()}
          className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
          style={{ animationDelay: '0.8s' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Employees</h2>
            <span className="text-sm text-gray-400">Last 5 added</span>
          </div>

          <div className="space-y-4">
            {stats?.recentEmployees?.map((employee, index) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 table-row-hover animate-fadeIn"
                style={{ animationDelay: `${0.9 + index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://picsum.photos/seed/${employee.id}/40/40.jpg`}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full border-2 border-slate-600 transition-transform duration-200 hover:scale-110"
                  />
                  <div>
                    <p className="text-white font-medium">{employee.name}</p>
                    <p className="text-gray-400 text-sm">{employee.jobTitle}</p>
                    {employee.department && (
                      <p className="text-gray-500 text-xs">{employee.department}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="badge-hover">
                    <StatusBadge status={employee.status} />
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Link>
      )}

      {/* Activity Feed - Role Restricted */}
      {(isAdmin || isHR || isManager) && (
        <ActivityFeed />
      )}

      {/* Advanced Analytics - Only for Admin, HR, Manager */}
      {(isAdmin || isHR || isManager) && (
        <div className="mt-8">
          <AdvancedAnalytics />
        </div>
      )}
    </LayoutWrapper>
  );
};

export default Dashboard;