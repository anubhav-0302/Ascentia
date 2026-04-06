import { useState, useEffect } from "react";
import { getDashboardStats, type DashboardStats } from "../api/dashboardApi";

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

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
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
        <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <i className="fas fa-users text-blue-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.totalEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Total Employees</p>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <i className="fas fa-user-check text-green-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.activeEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Active Employees</p>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <i className="fas fa-home text-purple-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Remote</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.remoteEmployees || 0}</h3>
          <p className="text-gray-400 text-sm">Remote Workers</p>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <i className="fas fa-building text-orange-400 text-xl"></i>
            </div>
            <span className="text-sm text-gray-400">Departments</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stats?.departments || 0}</h3>
          <p className="text-gray-400 text-sm">Total Departments</p>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Employees</h2>
          <span className="text-sm text-gray-400">Last 5 added</span>
        </div>

        <div className="space-y-4">
          {stats?.recentEmployees?.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50"
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