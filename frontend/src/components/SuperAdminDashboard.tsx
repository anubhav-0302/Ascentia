import React, { useEffect, useState } from 'react';
import { Building2, Users, Shield, HardDrive, Database, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getOrganizations } from '../api/orgApi';
import { apiClient } from '../api/apiClient';

interface PlatformStats {
  totalOrgs: number;
  activeOrgs: number;
  totalEmployees: number;
  totalAdmins: number;
  backupCount: number;
  latestBackup: string | null;
}

const SuperAdminDashboard: React.FC = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const [orgs, employeesRes, backupsRes, logsRes] = await Promise.allSettled([
          getOrganizations(token),
          apiClient.get('/employees'),
          apiClient.get('/data-protection/backups'),
          apiClient.get('/logs?page=1&limit=10'),
        ]);

        const orgList = orgs.status === 'fulfilled' ? orgs.value : [];
        const employees = employeesRes.status === 'fulfilled' ? (employeesRes.value?.data || []) : [];
        const backups = backupsRes.status === 'fulfilled'
          ? (backupsRes.value?.data?.backups || backupsRes.value?.data || [])
          : [];
        const logs = logsRes.status === 'fulfilled' ? (logsRes.value?.data?.logs || []) : [];

        setStats({
          totalOrgs: orgList.length,
          activeOrgs: orgList.filter((o: any) => o.isActive).length,
          totalEmployees: employees.length,
          totalAdmins: employees.filter((e: any) => ['admin', 'orgAdmin'].includes(e.role)).length,
          backupCount: backups.length,
          latestBackup: backups[0]?.createdAt || backups[0]?.timestamp || null,
        });
        setRecentLogs(logs.slice(0, 8));
      } catch (err: any) {
        setError(err?.message || 'Failed to load platform data');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

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
        <AlertTriangle className="inline w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'Organizations',   value: `${stats?.activeOrgs}/${stats?.totalOrgs}`, sub: 'active / total',           icon: Building2, color: 'from-teal-500 to-teal-600' },
    { label: 'Users (platform)', value: stats?.totalEmployees ?? 0,                sub: 'across all orgs',          icon: Users,     color: 'from-blue-500 to-blue-600' },
    { label: 'Admins',           value: stats?.totalAdmins ?? 0,                   sub: 'admin + orgAdmin',         icon: Shield,    color: 'from-purple-500 to-purple-600' },
    { label: 'Backups',          value: stats?.backupCount ?? 0,                   sub: stats?.latestBackup ? new Date(stats.latestBackup).toLocaleDateString() : 'none yet', icon: HardDrive, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Cross-organization overview. Use the org switcher in the header to scope into a specific tenant.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 hover:border-teal-500/40 transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">{c.label}</p>
                  <p className="text-3xl font-bold text-white mt-2">{c.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
                </div>
                <div className={`w-10 h-10 bg-gradient-to-br ${c.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backup health */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              Backup Health
            </h2>
            <p className="text-xs text-slate-400 mt-1">Latest snapshot & retention</p>
          </div>
          {stats?.latestBackup ? (
            <span className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Healthy
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              No backups yet
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Total backups</p>
            <p className="text-white font-medium">{stats?.backupCount ?? 0}</p>
          </div>
          <div>
            <p className="text-slate-400">Most recent</p>
            <p className="text-white font-medium">
              {stats?.latestBackup ? new Date(stats.latestBackup).toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Manage</p>
            <a href="/data-protection" className="text-teal-400 hover:underline">Open Data Protection →</a>
          </div>
        </div>
      </div>

      {/* Recent platform activity */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-blue-400" />
          Recent Platform Activity
        </h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-slate-700/50">
            {recentLogs.map((log, i) => (
              <li key={i} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <p className="text-white">
                    <span className="font-medium">{log.userName || 'System'}</span>{' '}
                    <span className="text-slate-400">{log.operation || log.action || 'event'}</span>{' '}
                    <span className="text-slate-500">on {log.entity || log.entityType || '—'}</span>
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <a href="/audit-logs" className="text-sm text-teal-400 hover:underline">View all logs →</a>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
