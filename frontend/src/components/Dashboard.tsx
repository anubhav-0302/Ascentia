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
  ResponsiveContainer
} from "recharts";

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

function getStatusBadge(status: string) {
  const statusConfig = {
    Active: "bg-green-400/20 text-green-400 border-green-400/30",
    Onboarding: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
    Remote: "bg-blue-400/20 text-blue-400 border-blue-400/30",
  };

  const dotColor = {
    Active: "bg-green-400",
    Onboarding: "bg-yellow-400",
    Remote: "bg-blue-400",
  };

  const configClass = statusConfig[status as keyof typeof statusConfig] || statusConfig["Active"];
  const dotClass = dotColor[status as keyof typeof dotColor] || dotColor["Active"];

  return (
    <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border " + configClass}>
      <span className={"w-2 h-2 rounded-full " + dotClass + " mr-2"}></span>
      {status}
    </span>
  );
}

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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-4xl mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <i className="fas fa-sync-alt"></i>
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-400">
          Overview of your HR metrics and employee data
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <i className="fas fa-users text-blue-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.totalEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Total Employees</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <i className="fas fa-user-check text-green-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.activeEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Active Employees</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <i className="fas fa-home text-purple-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Remote</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.remoteEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Remote Workers</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Distribution Pie Chart */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
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
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
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
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
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
      <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Employees</h2>
          <span className="text-sm text-gray-400">Last 5 added</span>
        </div>

        <div className="space-y-4">
          {stats?.recentEmployees?.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={`https://picsum.photos/seed/${employee.id}/40/40.jpg`}
                  alt={employee.name}
                  className="w-10 h-10 rounded-full border-2 border-slate-600"
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
                {getStatusBadge(employee.status)}
                <span className="text-gray-500 text-sm">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;