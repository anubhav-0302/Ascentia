import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader, AlertCircle } from 'lucide-react';
import { getPermissionAuditLog, type AuditLog } from '../api/roleManagementApi';

interface PermissionAuditLogProps {
  token: string;
}

const PermissionAuditLog: React.FC<PermissionAuditLogProps> = ({ token }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const limit = 20;

  useEffect(() => {
    fetchAuditLog();
  }, [page]);

  const fetchAuditLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPermissionAuditLog(page, limit, undefined, token);
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError('Failed to fetch audit log');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white">Permission Change History</h3>
        <p className="text-sm text-slate-400 mt-1">Track all permission changes made by administrators</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && logs.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 flex items-center justify-center">
          <Loader size={24} className="animate-spin text-teal-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 flex items-center justify-center">
          <p className="text-slate-400">No permission changes yet</p>
        </div>
      ) : (
        <>
          {/* Logs List */}
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                {/* Log Header */}
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white capitalize">{log.roleName}</span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          {log.module}
                        </span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Changed by {log.changedBy}</span>
                        <span>•</span>
                        <span>{formatDate(log.changedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {log.previousValue ? (
                          <span className="text-red-400">✓ → ✗</span>
                        ) : (
                          <span className="text-green-400">✗ → ✓</span>
                        )}
                      </span>
                    </div>
                    {expandedLogs.has(log.id) ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedLogs.has(log.id) && (
                  <div className="border-t border-slate-700 bg-slate-700/20 px-4 py-3 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Previous Value</p>
                        <p className="text-white font-mono mt-1">
                          {log.previousValue ? (
                            <span className="text-red-400">Enabled</span>
                          ) : (
                            <span className="text-slate-400">Disabled</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">New Value</p>
                        <p className="text-white font-mono mt-1">
                          {log.newValue ? (
                            <span className="text-green-400">Enabled</span>
                          ) : (
                            <span className="text-slate-400">Disabled</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Changed By</p>
                      <p className="text-white mt-1">
                        {log.changedBy} ({log.changedByEmail})
                      </p>
                    </div>

                    {log.reason && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Reason</p>
                        <p className="text-white mt-1 italic">{log.reason}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Changed At</p>
                      <p className="text-white font-mono mt-1">{formatDate(log.changedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded transition text-sm"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`px-3 py-2 rounded transition text-sm ${
                      page === p
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded transition text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PermissionAuditLog;
