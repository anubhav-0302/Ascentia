import React, { useEffect, useState } from 'react';
import { HardDrive, AlertTriangle, Database, Plus, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../api/apiClient';

interface Backup {
  id?: string | number;
  filename?: string;
  createdAt?: string;
  timestamp?: string;
  size?: number;
  type?: string;
}

interface DbStats {
  employees?: number;
  organizations?: number;
  leaveRequests?: number;
  timesheets?: number;
  logs?: number;
  [k: string]: any;
}

const formatBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const DataProtectionPage: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<DbStats | null>(null);
  const [deletionLogs, setDeletionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [b, s, d] = await Promise.allSettled([
        apiClient.get('/data-protection/backups'),
        apiClient.get('/data-protection/stats'),
        apiClient.get('/data-protection/deletion-logs'),
      ]);
      if (b.status === 'fulfilled') {
        const val = b.value?.data;
        setBackups(Array.isArray(val) ? val : (val?.backups || []));
      }
      if (s.status === 'fulfilled') setStats(s.value?.data || null);
      if (d.status === 'fulfilled') {
        const val = d.value?.data;
        setDeletionLogs(Array.isArray(val) ? val : (val?.logs || []));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load data protection info');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      await apiClient.post('/data-protection/backups', {});
      toast.success('Backup created');
      await load();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-700/50 rounded-lg text-red-300">
        <AlertTriangle className="inline w-5 h-5 mr-2" />{error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-amber-400" /> Data Protection
          </h1>
          <p className="text-sm text-slate-400 mt-1">Backups, database stats, and deletion audit trail.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded transition">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="flex items-center gap-1 text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white px-3 py-2 rounded transition"
          >
            <Plus className="w-4 h-4" /> {creating ? 'Creating…' : 'Create Backup'}
          </button>
        </div>
      </header>

      {/* Database stats */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-400" /> Database Statistics
        </h2>
        {!stats ? (
          <p className="text-sm text-slate-400">No stats available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(stats).map(([k, v]) => (
              <div key={k} className="bg-slate-900/60 rounded-lg p-3">
                <p className="text-xs uppercase tracking-wider text-slate-400">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="text-2xl font-bold text-white mt-1">{typeof v === 'number' ? v.toLocaleString() : String(v ?? '—')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backups table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Backups ({backups.length})</h2>
        {backups.length === 0 ? (
          <p className="text-sm text-slate-400">No backups yet. Click <span className="text-teal-400">Create Backup</span> to capture a snapshot.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-700/50">
                  <th className="py-2 pr-4">Filename</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {backups.map((b, i) => (
                  <tr key={b.id || b.filename || i} className="text-slate-200">
                    <td className="py-2 pr-4 font-mono text-xs">{b.filename || b.id || '—'}</td>
                    <td className="py-2 pr-4">{b.createdAt || b.timestamp ? new Date((b.createdAt || b.timestamp)!).toLocaleString() : '—'}</td>
                    <td className="py-2 pr-4">{formatBytes(b.size)}</td>
                    <td className="py-2 pr-4">{b.type || 'manual'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deletion logs */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-red-400" /> Deletion Audit Trail
        </h2>
        {deletionLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No protected deletions recorded.</p>
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {deletionLogs.slice(0, 20).map((log, i) => (
              <li key={i} className="py-2 text-sm flex items-center justify-between">
                <div>
                  <p className="text-white">{log.entityType || log.entity || 'record'} #{log.entityId || log.id}</p>
                  <p className="text-xs text-slate-500">by {log.deletedBy || log.userName || 'system'}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {log.deletedAt || log.timestamp ? new Date(log.deletedAt || log.timestamp).toLocaleString() : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DataProtectionPage;
