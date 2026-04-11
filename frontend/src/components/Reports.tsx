import React from 'react';
import { Link } from 'react-router-dom';
import { StandardLayout } from './StandardLayout';
import { FileText, TrendingUp, Download, Calendar, BarChart3, PieChart, Activity } from 'lucide-react';
import Card from './Card';
import Filter from './Filter';
import { useFilters } from '../contexts/FilterContext';
import { PageTransition, FadeIn } from './PageTransition';

const Reports: React.FC = () => {
  const { filters } = useFilters();

  const reportStats = [
    {
      title: 'Reports Generated',
      value: '47',
      change: '+12 this week',
      icon: FileText,
      color: 'text-blue-400',
      link: '/reports'
    },
    {
      title: 'Automated Reports',
      value: '15',
      change: 'Running',
      icon: Calendar,
      color: 'text-green-400',
      link: '/workflow-hub'
    },
    {
      title: 'Data Processing',
      value: '99.2%',
      change: '+0.1%',
      icon: TrendingUp,
      color: 'text-purple-400',
      link: '/payroll-benefits'
    },
    {
      title: 'Storage Used',
      value: '2.8 GB',
      change: '+120 MB',
      icon: Download,
      color: 'text-yellow-400',
      link: '/settings'
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Monthly Performance Report',
      type: 'Performance',
      date: '2024-01-15',
      status: 'Completed',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Employee Attendance Summary',
      type: 'Attendance',
      date: '2024-01-14',
      status: 'Completed',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      id: 3,
      name: 'Department Budget Analysis',
      type: 'Financial',
      date: '2024-01-13',
      status: 'Processing',
      size: '-',
      format: 'PDF'
    },
    {
      id: 4,
      name: 'Recruitment Pipeline Report',
      type: 'Recruitment',
      date: '2024-01-12',
      status: 'Completed',
      size: '3.1 MB',
      format: 'PDF'
    }
  ];

  // Filter recent reports based on filter context
  const filteredReports = React.useMemo(() => {
    return recentReports.filter(report => {
      const matchesSearch = !filters.search || 
        report.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.type.toLowerCase().includes(filters.search.toLowerCase());

      const matchesReportType = !filters.reportType || filters.reportType === 'all' ||
        report.type.toLowerCase() === filters.reportType.toLowerCase();

      const matchesStatus = !filters.status || filters.status === 'all' ||
        report.status.toLowerCase() === filters.status.toLowerCase();

      // Date range filtering
      let matchesDateRange = !filters.dateRange || filters.dateRange === 'all';
      if (!matchesDateRange) {
        const reportDate = new Date(report.date);
        const now = new Date();
        
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

      return matchesSearch && matchesReportType && matchesStatus && matchesDateRange;
    }).sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [recentReports, filters]);

  const reportTemplates = [
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
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default Reports;