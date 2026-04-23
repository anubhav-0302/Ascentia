import React, { useEffect, useState } from 'react';
import { Shield, Building2, UserPlus, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { getOrganizations, getOrgAdmins, assignOrgAdmin, type Organization } from '../api/orgApi';

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
}

const OrgAdminsPage: React.FC = () => {
  const { token } = useAuthStore();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [adminsByOrg, setAdminsByOrg] = useState<Record<number, Employee[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOrg, setAssignOrg] = useState<Organization | null>(null);
  const [candidates, setCandidates] = useState<Employee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [token]);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const list = await getOrganizations(token);
      setOrgs(list);
      // Load admins for each org in parallel
      const entries = await Promise.all(
        list.map(async (o) => {
          try {
            const admins = await getOrgAdmins(o.id, token);
            return [o.id, admins] as const;
          } catch {
            return [o.id, []] as const;
          }
        })
      );
      setAdminsByOrg(Object.fromEntries(entries));
    } catch (err: any) {
      setError(err?.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const openAssign = async (org: Organization) => {
    setAssignOrg(org);
    setSelectedUserId(null);
    // Load employees scoped to that org — SuperAdmin + header approach is used
    // by setting the org temporarily via X-Organization-Id. But apiClient reads
    // from localStorage, so do a direct fetch with the header here.
    try {
      const res = await fetch(`http://localhost:5000/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Organization-Id': String(org.id),
        },
      });
      const json = await res.json();
      setCandidates((json?.data || []).filter((e: Employee) => e.role !== 'orgAdmin' && e.role !== 'superAdmin'));
    } catch {
      setCandidates([]);
    }
  };

  const submitAssign = async () => {
    if (!assignOrg || !selectedUserId || !token) return;
    try {
      await assignOrgAdmin(assignOrg.id, selectedUserId, token);
      toast.success('Org admin assigned');
      setAssignOrg(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign org admin');
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
      <header>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-teal-400" /> Org Admins
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage the admin user for each organization. Each org can have multiple orgAdmins.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orgs.map((org) => {
          const admins = adminsByOrg[org.id] || [];
          return (
            <div key={org.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {org.name}
                  </p>
                  <p className="text-xs text-slate-500">{org.code} • {org.subscriptionPlan}</p>
                </div>
                <button
                  onClick={() => openAssign(org)}
                  className="flex items-center gap-1 text-sm bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 px-3 py-1.5 rounded transition"
                >
                  <UserPlus className="w-4 h-4" /> Assign
                </button>
              </div>
              {admins.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No admins assigned</p>
              ) : (
                <ul className="space-y-1">
                  {admins.map((a) => (
                    <li key={a.id} className="text-sm flex items-center justify-between py-1">
                      <span className="text-slate-200">{a.name}</span>
                      <span className="text-xs text-slate-500">{a.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      {assignOrg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Assign Org Admin — {assignOrg.name}</h3>
              <button onClick={() => setAssignOrg(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {candidates.length === 0 ? (
              <p className="text-sm text-slate-400">No eligible employees in this org.</p>
            ) : (
              <>
                <label className="text-sm text-slate-300 block mb-2">Select an employee to promote:</label>
                <select
                  value={selectedUserId ?? ''}
                  onChange={(e) => setSelectedUserId(Number(e.target.value) || null)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">— Choose —</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email}) · {c.role}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setAssignOrg(null)} className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition">
                    Cancel
                  </button>
                  <button
                    onClick={submitAssign}
                    disabled={!selectedUserId}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition"
                  >
                    Assign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgAdminsPage;
