import React, { useState, useEffect, useMemo } from 'react';
import { StandardLayout } from './StandardLayout';
import { PageTransition, FadeIn } from './PageTransition';
import { logsApi, type AuditLog, type LogStatistics } from '../api/logsApi';
import { useIsAdmin } from '../store/useAuthStore';
import { 
  Clock, 
  Filter, 
  User, 
  Activity, 
  Database,
  TrendingUp,
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react';

const AuditLogs: React.FC = () => {
  const isAdmin = useIsAdmin();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Filter states
  const [operationFilter, setOperationFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load logs
  const loadLogs = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setLogs([]);
      }
      
      const params: any = {
        page: pageNum,
        limit: 200
      };

      if (operationFilter) params.operation = operationFilter;
      if (entityFilter) params.entity = entityFilter;
      if (userFilter) params.userId = userFilter;

      const response = await logsApi.getLogs(params);
      
      if (response.success) {
        if (reset) {
          setLogs(response.data.logs);
        } else {
          setLogs(prev => [...prev, ...response.data.logs]);
        }
        setTotal(response.data.total);
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await logsApi.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      loadLogs(1, true);
      loadStatistics();
    }
  }, [isAdmin, operationFilter, entityFilter, userFilter]);

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString();
  };

  // Get operation color
  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'CREATE': return 'text-green-400 bg-green-400/10';
      case 'UPDATE': return 'text-blue-400 bg-blue-400/10';
      case 'DELETE': return 'text-red-400 bg-red-400/10';
      case 'READ': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    
    return logs.filter(log => 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [logs, searchTerm]);

  // Get unique operations and entities for filters
  const uniqueOperations = useMemo(() => {
    const ops = new Set(logs.map(log => log.operation));
    return Array.from(ops);
  }, [logs]);

  const uniqueEntities = useMemo(() => {
    const entities = new Set(logs.map(log => log.entity));
    return Array.from(entities);
  }, [logs]);

  // Load more logs
  const loadMore = () => {
    if (hasMore && !loading) {
      loadLogs(page + 1, false);
    }
  };

  // Refresh logs
  const refresh = () => {
    loadLogs(1, true);
    loadStatistics();
  };

  // Clear filters
  const clearFilters = () => {
    setOperationFilter('');
    setEntityFilter('');
    setUserFilter('');
    setSearchTerm('');
  };

  if (!isAdmin) {
    return (
      <PageTransition>
        <StandardLayout title="Access Denied" description="You don't have permission to view audit logs">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You need administrator privileges to view audit logs.</p>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StandardLayout 
        title="Audit Logs" 
        description="Track system activity and user actions"
      >
        <FadeIn delay={100}>
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-teal-400" />
                  <span className="text-sm text-gray-400">Total</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{statistics.totalLogs}</h3>
                <p className="text-gray-400 text-sm">Total Logs</p>
              </div>
              
              <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-gray-400">24h</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{statistics.last24Hours}</h3>
                <p className="text-gray-400 text-sm">Last 24 Hours</p>
              </div>
              
              <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-green-400" />
                  <span className="text-sm text-gray-400">7d</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{statistics.last7Days}</h3>
                <p className="text-gray-400 text-sm">Last 7 Days</p>
              </div>
              
              <div className="p-6 bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-sm text-gray-400">30d</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{statistics.last30Days}</h3>
                <p className="text-gray-400 text-sm">Last 30 Days</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-400" />
                Filters
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={refresh}
                  className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              {/* Operation Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Operation
                </label>
                <select
                  value={operationFilter}
                  onChange={(e) => setOperationFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Operations</option>
                  {uniqueOperations.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
              
              {/* Entity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entity
                </label>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Entities</option>
                  {uniqueEntities.map(entity => (
                    <option key={entity} value={entity}>{entity}</option>
                  ))}
                </select>
              </div>
              
              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder="Enter user ID..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-400" />
                Audit Logs {total > 0 && `(${filteredLogs.length}/${total})`}
              </h3>
            </div>
            
            {loading && logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Activity Logs</h3>
                <p className="text-gray-400">
                  {searchTerm || operationFilter || entityFilter || userFilter 
                    ? 'No logs found matching your filters.' 
                    : 'No activity logs available.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Entity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className="border-b border-slate-700 hover:bg-slate-700/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-white text-sm">{log.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getOperationColor(log.operation)}`}>
                            {log.operation}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span className="text-white text-sm">{log.entity}</span>
                            {log.details && (
                              <p className="text-gray-400 text-xs mt-1">
                                {typeof log.details === 'string' 
                                  ? log.details 
                                  : JSON.stringify(log.details).substring(0, 50) + '...'}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <span className="text-white text-sm">{formatTimeAgo(log.timestamp)}</span>
                              <p className="text-gray-400 text-xs">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default AuditLogs;
