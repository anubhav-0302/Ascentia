import { useState, useEffect } from "react";
import { getDashboardStats, type DashboardStats } from "../api/dashboardApi";
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
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import SkeletonLoader, { CardSkeleton, ChartSkeleton, TableSkeleton } from "./SkeletonLoader";
import ActivityFeed from "./ActivityFeed";
import LayoutWrapper from "./LayoutWrapper";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for charts (will be replaced with real API data)
  const mockChartData = {
    departmentDistribution: [
      { name: 'Engineering', count: 45 },
      { name: 'Sales', count: 32 },
      { name: 'Marketing', count: 28 },
      { name: 'HR', count: 15 },
      { name: 'Finance', count: 20 },
      { name: 'Operations', count: 25 }
    ],
    leaveStatus: [
      { status: 'Approved', count: 68 },
      { status: 'Pending', count: 23 },
      { status: 'Rejected', count: 12 }
    ],
    leaveTrends: [
      { month: 'Jan', approved: 45, pending: 12, rejected: 5 },
      { month: 'Feb', approved: 52, pending: 15, rejected: 8 },
      { month: 'Mar', approved: 48, pending: 18, rejected: 6 },
      { month: 'Apr', approved: 61, pending: 14, rejected: 9 },
      { month: 'May', approved: 55, pending: 20, rejected: 7 },
      { month: 'Jun', approved: 68, pending: 23, rejected: 12 }
    ]
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      
      // Merge real data with mock chart data
      const enrichedData = {
        ...data,
        departmentDistribution: data.departmentDistribution || mockChartData.departmentDistribution,
        leaveStatus: data.leaveStatus || mockChartData.leaveStatus,
        leaveTrends: data.leaveTrends || mockChartData.leaveTrends
      };
      
      setStats(enrichedData);
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
          Dashboard
        </h1>
        <p className="text-gray-400">
          Overview of your HR metrics and employee data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <i className="fas fa-users text-blue-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.totalEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Total Employees</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <i className="fas fa-user-check text-green-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.activeEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Active Employees</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <i className="fas fa-home text-purple-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Remote</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.remoteEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Remote Workers</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <i className="fas fa-building text-orange-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Departments</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.departments || 0}</h3>
          <p className="text-gray-400 text-sm">Total Departments</p>
        </div>
      </div>

      {/* Insights & Alerts Section */}
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
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
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

            <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-users text-green-400 text-sm"></i>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Retention Risk Alert</h4>
                  <p className="text-gray-400 text-sm mb-2">
                    3 employees in the Engineering department show signs of potential turnover based on recent activity patterns and engagement metrics.
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-yellow-400"><i className="fas fa-exclamation-triangle mr-1"></i>Medium priority</span>
                    <button className="text-teal-400 hover:text-teal-300">Take Action →</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-lightbulb text-yellow-400 text-sm"></i>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Skills Gap Analysis</h4>
                  <p className="text-gray-400 text-sm mb-2">
                    Consider upskilling 5 team members in cloud technologies. Current demand exceeds available expertise by 40%.
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-blue-400"><i className="fas fa-graduation-cap mr-1"></i>Training opportunity</span>
                    <button className="text-teal-400 hover:text-teal-300">View Details →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 animate-fadeIn" style={{ animationDelay: '0.9s' }}>
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <i className="fas fa-bolt text-yellow-400 mr-2"></i>
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            <button className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors duration-200">
                  <i className="fas fa-user-plus text-teal-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Add Employee</p>
                  <p className="text-gray-500 text-xs">Onboard new team member</p>
                </div>
              </div>
            </button>

            <button className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                  <i className="fas fa-calendar-plus text-blue-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Approve Leave</p>
                  <p className="text-gray-500 text-xs">3 pending requests</p>
                </div>
              </div>
            </button>

            <button className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group">
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

            <button className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-200">
                  <i className="fas fa-bullhorn text-green-400 text-sm"></i>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Send Announcement</p>
                  <p className="text-gray-500 text-xs">Company-wide notice</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Trend Chart */}
      <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 mb-8 animate-fadeIn" style={{ animationDelay: '1.0s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <i className="fas fa-chart-area text-blue-400 mr-2"></i>
            Performance Trends
          </h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-xs bg-teal-600 text-white rounded-lg">6M</button>
            <button className="px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg">1Y</button>
            <button className="px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg">All</button>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={[
            { month: 'Jan', performance: 82, target: 85, engagement: 78 },
            { month: 'Feb', performance: 84, target: 85, engagement: 80 },
            { month: 'Mar', performance: 83, target: 85, engagement: 82 },
            { month: 'Apr', performance: 86, target: 85, engagement: 84 },
            { month: 'May', performance: 87, target: 85, engagement: 85 },
            { month: 'Jun', performance: 89, target: 85, engagement: 87 }
          ]}>
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
            <Area 
              type="monotone" 
              dataKey="performance" 
              stackId="1"
              stroke="#3B82F6" 
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="engagement" 
              stackId="2"
              stroke="#10B981" 
              fill="#10B981"
              fillOpacity={0.6}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#F59E0B" 
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Distribution Pie Chart */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
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
        </div>

        {/* Leave Status Bar Chart */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Leave Status Overview</h3>
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
        </div>

        {/* Leave Trends Line Chart */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.7s' }}>
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
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover p-6 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
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
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </LayoutWrapper>
  );
};

export default Dashboard;