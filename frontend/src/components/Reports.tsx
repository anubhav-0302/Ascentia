import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StandardLayout } from './StandardLayout';
import { FileText, TrendingUp, Download, Calendar, BarChart3, PieChart, Activity, Users, Briefcase, AlertCircle } from 'lucide-react';
import Card from './Card';
import Filter from './Filter';
import { useFilters } from '../contexts/FilterContext';
import { PageTransition, FadeIn } from './PageTransition';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { getMyLeaves, getAllLeaves, type LeaveRequest } from '../api/leaveApi';
import { useIsAdmin } from '../store/useAuthStore';

interface RecentReport {
  id: number;
  name: string;
  type: string;
  date: string;
  status: string;
  size: string;
  format: string;
}

interface ReportTemplate {
  name: string;
  description: string;
  icon: any;
  color: string;
  frequency: string;
}

const Reports: React.FC = () => {
  const { filters } = useFilters();
  const { employees, fetchEmployees } = useEmployeeStore();
  const isAdmin = useIsAdmin();
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load leave data on component mount
  useEffect(() => {
    const loadLeaveData = async () => {
      try {
        if (isAdmin) {
          const response = await getAllLeaves();
          setLeaveData(response && response.data ? response.data : (response || []));
        } else {
          const response = await getMyLeaves();
          setLeaveData(response && response.data ? response.data : (response || []));
        }
      } catch (error) {
        console.error('Failed to load leave data:', error);
        setLeaveData([]);
      } finally {
        setLoading(false);
      }
    };

    // Load employees if not already loaded
    if (employees.length === 0) {
      fetchEmployees();
    }
    
    loadLeaveData();
  }, [isAdmin, employees.length, fetchEmployees]);

  // Calculate real report stats using useMemo for performance
  const reportStats = useMemo(() => {
    if (loading) {
      return [
        {
          title: 'Total Employees',
          value: '...',
          change: 'Loading',
          icon: Users,
          color: 'text-gray-400',
          link: '/directory'
        },
        {
          title: 'Active Employees',
          value: '...',
          change: 'Loading',
          icon: Briefcase,
          color: 'text-gray-400',
          link: '/directory'
        },
        {
          title: 'Total Leave Requests',
          value: '...',
          change: 'Loading',
          icon: Calendar,
          color: 'text-gray-400',
          link: '/leave-attendance'
        },
        {
          title: 'Pending Approvals',
          value: '...',
          change: 'Loading',
          icon: AlertCircle,
          color: 'text-gray-400',
          link: '/leave-attendance'
        }
      ];
    }

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
    const totalLeaves = leaveData.length;
    const pendingLeaves = leaveData.filter(leave => leave.status === 'Pending').length;

    return [
      {
        title: 'Total Employees',
        value: totalEmployees.toString(),
        change: activeEmployees > 0 ? `${activeEmployees} active` : 'No active employees',
        icon: Users,
        color: totalEmployees > 0 ? 'text-teal-400' : 'text-gray-400',
        link: '/directory'
      },
      {
        title: 'Active Employees',
        value: activeEmployees.toString(),
        change: totalEmployees > 0 ? `${Math.round((activeEmployees / totalEmployees) * 100)}% of total` : 'No employees',
        icon: Briefcase,
        color: activeEmployees > 0 ? 'text-green-400' : 'text-gray-400',
        link: '/directory'
      },
      {
        title: 'Total Leave Requests',
        value: totalLeaves.toString(),
        change: totalLeaves > 0 ? `${leaveData.filter(l => l.status === 'Approved').length} approved` : 'No requests',
        icon: Calendar,
        color: totalLeaves > 0 ? 'text-blue-400' : 'text-gray-400',
        link: '/leave-attendance'
      },
      {
        title: 'Pending Approvals',
        value: pendingLeaves.toString(),
        change: pendingLeaves > 0 ? 'Action needed' : 'All processed',
        icon: AlertCircle,
        color: pendingLeaves > 0 ? 'text-yellow-400' : 'text-green-400',
        link: '/leave-attendance'
      }
    ];
  }, [employees, leaveData, loading]);

  // Create recent reports from actual leave data
  const recentReports: RecentReport[] = useMemo(() => {
    if (loading || leaveData.length === 0) return [];

    return leaveData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((leave) => ({
        id: leave.id,
        name: `${leave.type} Leave - ${leave.user?.name || 'Unknown User'}`,
        type: leave.type || 'Unknown',
        date: leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : 'Unknown Date',
        status: leave.status || 'Unknown',
        size: '~2 KB',
        format: 'PDF'
      }));
  }, [leaveData, loading]);

  // Calculate department distribution
  const departmentDistribution = useMemo(() => {
    if (loading || employees.length === 0) return [];

    const deptCounts = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [employees, loading]);

  // Calculate leave statistics
  const leaveStatistics = useMemo(() => {
    if (loading || leaveData.length === 0) {
      return { total: 0, approved: 0, pending: 0, rejected: 0 };
    }

    return {
      total: leaveData.length,
      approved: leaveData.filter(l => l.status === 'Approved').length,
      pending: leaveData.filter(l => l.status === 'Pending').length,
      rejected: leaveData.filter(l => l.status === 'Rejected').length
    };
  }, [leaveData, loading]);

  // Filter recent reports based on filter context
  const filteredReports = React.useMemo(() => {
    if (!recentReports || recentReports.length === 0) return [];

    return recentReports.filter(report => {
      try {
        const matchesSearch = !filters.search || 
          report.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          report.type.toLowerCase().includes(filters.search.toLowerCase());

        const matchesReportType = !filters.reportType || filters.reportType === 'all' ||
          report.type.toLowerCase() === filters.reportType.toLowerCase();

        const matchesStatus = !filters.status || filters.status === 'all' ||
          report.status.toLowerCase() === filters.status.toLowerCase();

        // Date range filtering with error handling
        let matchesDateRange = !filters.dateRange || filters.dateRange === 'all';
        if (!matchesDateRange) {
          try {
            const reportDate = new Date(report.date);
            const now = new Date();
            
            // Check if date is valid
            if (isNaN(reportDate.getTime())) {
              matchesDateRange = true; // If invalid date, include in results
            } else {
              switch (filters.dateRange) {
                case 'today':
                  matchesDateRange = reportDate.toDateString() === now.toDateString();
                  break;
                case 'last-7-days':
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  matchesDateRange = reportDate >= weekAgo;
                  break;
                case 'last-30-days':
                  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                  matchesDateRange = reportDate >= monthAgo;
                  break;
                default:
                  matchesDateRange = true;
              }
            }
          } catch (error) {
            console.error('Date filtering error:', error);
            matchesDateRange = true; // Include on error
          }
        }

        return matchesSearch && matchesReportType && matchesStatus && matchesDateRange;
      } catch (error) {
        console.error('Report filtering error:', error);
        return true; // Include report on error
      }
    }).sort((a, b) => {
      try {
        const { sortBy, sortOrder } = filters;
        let comparison = 0;
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'date':
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              comparison = dateA.getTime() - dateB.getTime();
            } catch (error) {
              comparison = 0; //fallback
            }
            break;
          case 'status':
            comparison = a.status.localeCompare(b.status);
            break;
          default:
            try {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              comparison = dateA.getTime() - dateB.getTime();
            } catch (error) {
              comparison = 0; //fallback
            }
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      } catch (error) {
        console.error('Report sorting error:', error);
        return 0; // No change on error
      }
    });
  }, [recentReports, filters]);

  const reportTemplates: ReportTemplate[] = [
    {
      name: 'Employee Performance',
      description: 'Individual and team performance metrics',
      icon: BarChart3,
      color: 'bg-blue-500/20 text-blue-400',
      frequency: 'Monthly'
    },
    {
      name: 'Attendance & Leave',
      description: 'Attendance patterns and leave balances',
      icon: Calendar,
      color: 'bg-green-500/20 text-green-400',
      frequency: 'Weekly'
    },
    {
      name: 'Payroll Summary',
      description: 'Salary, bonuses, and compensation analysis',
      icon: TrendingUp,
      color: 'bg-purple-500/20 text-purple-400',
      frequency: 'Monthly'
    },
    {
      name: 'Department Analytics',
      description: 'Department-wise performance and metrics',
      icon: PieChart,
      color: 'bg-yellow-500/20 text-yellow-400',
      frequency: 'Quarterly'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-400/10';
      case 'Processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'Failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return '📄';
      case 'Excel': return '📊';
      case 'CSV': return '📋';
      default: return '📄';
    }
  };

  const handleExportAll = () => {
    const exportData = {
      reports: filteredReports,
      stats: reportStats,
      exportDate: new Date().toISOString(),
      filters: filters
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (report: any) => {
    alert(`Downloading report: ${report.name}\n\nThis would download the actual ${report.format} file.`);
  };

  const handleGenerateReport = (template: any) => {
    alert(`Generating report: ${template.name}\n\nThis would navigate to a report configuration page with customizable parameters and scheduling options.`);
  };

  return (
    <PageTransition>
      <StandardLayout 
        title="Reports"
        description="Generate and view HR analytics reports"
      >
        <FadeIn delay={100}>
          {/* Filter Component */}
          <Filter
            showDepartment={false}
            showStatus={true}
            showDateRange={true}
            showReportType={true}
            showEmploymentType={false}
            showLocation={false}
            showSortOptions={true}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {reportStats.map((stat, index) => (
              <Link 
                key={index}
                to={stat.link}
                className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg card-hover cursor-pointer hover:border-teal-500/30 transition-all duration-200 block"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <span className="text-sm text-gray-400">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Reports */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Recent Reports {filteredReports.length !== recentReports.length && `(${filteredReports.length}/${recentReports.length})`}
                  </h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleExportAll}
                      className="px-3 py-1 text-sm bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export Filtered
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No reports found matching your filters.</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{getFormatIcon(report.format)}</div>
                          <div>
                            <h4 className="text-white font-medium">{report.name}</h4>
                            <p className="text-gray-400 text-sm">{report.type} • {report.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Size</p>
                            <p className="text-sm text-white">{report.size}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                          <button 
                            onClick={() => handleDownloadReport(report)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Report Templates */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-400" />
                  Quick Generate
                </h3>
                <div className="space-y-3">
                  {reportTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleGenerateReport(template)}
                      className="w-full p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color} group-hover:scale-110 transition-transform`}>
                          <template.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{template.name}</p>
                          <p className="text-gray-400 text-xs">{template.description}</p>
                          <p className="text-gray-500 text-xs mt-1">{template.frequency}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Additional Report Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Department Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-yellow-400" />
                Department Distribution
              </h3>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                  <p className="text-gray-400 text-sm mt-2">Loading department data...</p>
                </div>
              ) : departmentDistribution.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400">No department data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {departmentDistribution.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                        <span className="text-white font-medium">{dept.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 text-sm">
                          {dept.count} employee{dept.count !== 1 ? 's' : ''}
                        </span>
                        <span className="text-teal-400 font-medium">
                          {Math.round((dept.count / employees.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Leave Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-400" />
                Leave Statistics
              </h3>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                  <p className="text-gray-400 text-sm mt-2">Loading leave data...</p>
                </div>
              ) : leaveStatistics.total === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400">No leave data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-3xl font-bold text-teal-400">{leaveStatistics.total}</p>
                    <p className="text-gray-400 text-sm">Total Leave Requests</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <p className="text-xl font-bold text-green-400">{leaveStatistics.approved}</p>
                      <p className="text-gray-400 text-xs">Approved</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                      <p className="text-xl font-bold text-yellow-400">{leaveStatistics.pending}</p>
                      <p className="text-gray-400 text-xs">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg">
                      <p className="text-xl font-bold text-red-400">{leaveStatistics.rejected}</p>
                      <p className="text-gray-400 text-xs">Rejected</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default Reports;