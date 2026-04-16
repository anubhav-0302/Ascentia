import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { getAnalytics, type AnalyticsData, type AnalyticsInsight, type AnalyticsWarning } from '../api/analyticsApi';
import { useAuthStore } from '../store/useAuthStore';
import SkeletonLoader from './SkeletonLoader';

// Color schemes (reusing from Dashboard)
const DEPARTMENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const LEAVE_STATUS_COLORS = {
  Approved: '#10B981',
  Pending: '#F59E0B',
  Rejected: '#EF4444'
};
const TREND_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444'
};

const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Memoize processed data to avoid unnecessary re-renders
  const processedData = useMemo(() => {
    if (!analytics) return null;

    return {
      insights: analytics.insights.slice(0, 6), // Show top 6 insights
      warnings: analytics.warnings.slice(0, 3), // Show top 3 warnings
      hasData: Object.keys(analytics.charts).length > 0
    };
  }, [analytics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-800 rounded-lg p-4">
              <SkeletonLoader height={200} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || !processedData?.hasData) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 text-center">
        <p className="text-slate-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
        <span className="text-sm text-slate-400">
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} View
        </span>
      </div>

      {/* Key Insights */}
      {processedData.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processedData.insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      )}

      {/* Warnings */}
      {processedData.warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Alerts & Warnings</h3>
          {processedData.warnings.map((warning, index) => (
            <WarningCard key={index} warning={warning} />
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        {analytics.charts.departmentDistribution && (
          <ChartCard title="Department Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.charts.departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.charts.departmentDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Leave Trends */}
        {analytics.charts.leaveTrends && (
          <ChartCard title="Leave Trends (6 Months)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.charts.leaveTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="approved" stroke={LEAVE_STATUS_COLORS.Approved} strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke={LEAVE_STATUS_COLORS.Pending} strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke={LEAVE_STATUS_COLORS.Rejected} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Timesheet Hours */}
        {analytics.charts.timesheetHours && (
          <ChartCard title="Weekly Timesheet Hours">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.charts.timesheetHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="hours" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top Performers */}
        {analytics.charts.topPerformers && (
          <ChartCard title="Top Performers">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.charts.topPerformers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" domain={[0, 5]} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="rating" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analytics.metrics.employees && (
          <MetricCard
            title="Total Employees"
            value={analytics.metrics.employees.total}
            subtitle={`${analytics.metrics.employees.active} active`}
          />
        )}
        {analytics.metrics.leave && (
          <MetricCard
            title="Pending Leaves"
            value={analytics.metrics.leave.pending}
            subtitle={`${analytics.metrics.leave.approved} approved`}
          />
        )}
        {analytics.metrics.timesheets && (
          <MetricCard
            title="Avg Hours/Week"
            value={analytics.metrics.timesheets.avgHours}
            subtitle={`${analytics.metrics.timesheets.totalHours} total`}
          />
        )}
        {analytics.metrics.performance && (
          <MetricCard
            title="Avg Performance"
            value={`${analytics.metrics.performance.avgRating}/5`}
            subtitle={`${analytics.metrics.performance.totalReviews} reviews`}
          />
        )}
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard: React.FC<{ insight: AnalyticsInsight }> = ({ insight }) => {
  const trendColor = TREND_COLORS[insight.trend];
  
  return (
    <div className="bg-gradient-to-r from-teal-500/10 to-slate-800 border border-teal-500/20 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white">{insight.title}</h4>
        <span className="text-2xl font-bold" style={{ color: trendColor }}>
          {insight.value}
        </span>
      </div>
      <p className="text-sm text-slate-300">{insight.description}</p>
      <div className="mt-2 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trendColor }}></span>
        <span className="text-xs text-slate-400 capitalize">{insight.trend}</span>
      </div>
    </div>
  );
};

// Warning Card Component
const WarningCard: React.FC<{ warning: AnalyticsWarning }> = ({ warning }) => {
  const severityColors = {
    low: 'border-yellow-500/20 bg-yellow-500/10',
    medium: 'border-orange-500/20 bg-orange-500/10',
    high: 'border-red-500/20 bg-red-500/10'
  };

  return (
    <div className={`border rounded-lg p-4 ${severityColors[warning.severity]}`}>
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-white">{warning.title}</h4>
        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 capitalize">
          {warning.severity}
        </span>
      </div>
      <p className="text-sm text-slate-300 mt-1">{warning.description}</p>
    </div>
  );
};

// Chart Card Component
const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{ title: string; value: string | number; subtitle: string }> = ({
  title,
  value,
  subtitle
}) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
};

export default AdvancedAnalytics;
