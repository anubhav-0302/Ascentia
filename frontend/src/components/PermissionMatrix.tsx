import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { getRolePermissions, updateRolePermissions, type Role, type PermissionUpdate } from '../api/roleManagementApi';

interface PermissionMatrixProps {
  role: Role;
  token: string;
  onSuccess: () => void;
}

interface PermissionState {
  [module: string]: {
    [action: string]: boolean;
  };
}

// Define which actions apply to each module based on actual implementation
const MODULE_ACTIONS: { [module: string]: string[] } = {
  payroll: ['view', 'create', 'edit', 'delete'],
  performance: ['view', 'create', 'edit', 'delete'],
  timesheet: ['view', 'create', 'edit', 'delete', 'approve'],
  leave: ['view', 'create', 'edit', 'delete', 'approve'],
  employees: ['view', 'create', 'edit', 'delete'],
  documents: ['view', 'create', 'delete'],
  reports: ['view', 'export'],
  audit: ['view'],
  settings: ['view', 'edit'],
  users: ['view', 'create', 'edit', 'delete'],
  kra: ['view', 'create', 'edit', 'delete'],
  workflow: ['view', 'create', 'edit', 'delete'],
  command: ['view', 'create', 'edit', 'delete']
};

// Sidebar menu items with their required roles (synced with Sidebar.tsx)
const SIDEBAR_MENU_ITEMS: { [key: string]: { label: string; requiredRoles: string[] } } = {
  'dashboard': { label: 'Dashboard', requiredRoles: ['admin', 'manager', 'employee'] },
  'command-center': { label: 'Command Center', requiredRoles: ['admin'] },
  'workflow-hub': { label: 'Workflow Hub', requiredRoles: ['admin'] },
  'my-team': { label: 'My Team', requiredRoles: ['admin', 'manager'] },
  'directory': { label: 'Directory', requiredRoles: ['admin', 'hr'] },
  'leave-attendance': { label: 'Leave & Attendance', requiredRoles: ['admin', 'manager', 'employee', 'hr'] },
  'timesheet-entry': { label: 'Timesheet Entry', requiredRoles: ['admin', 'manager', 'employee', 'hr'] },
  'performance-goals': { label: 'Performance Goals', requiredRoles: ['admin', 'manager', 'employee'] },
  'payroll-benefits': { label: 'Payroll & Benefits', requiredRoles: ['admin', 'employee', 'hr'] },
  'recruiting': { label: 'Recruiting', requiredRoles: ['admin'] },
  'reports': { label: 'Reports', requiredRoles: ['admin', 'manager', 'hr'] },
  'audit-logs': { label: 'Audit Logs', requiredRoles: ['admin'] },
  'permission-management': { label: 'Permission Management', requiredRoles: ['admin'] },
  'role-management': { label: 'Role Management', requiredRoles: ['admin'] },
  'profile': { label: 'Profile', requiredRoles: ['admin', 'manager', 'employee'] },
  'settings': { label: 'Settings', requiredRoles: ['admin', 'manager', 'employee'] }
};

const MODULES = Object.keys(MODULE_ACTIONS);
const ALL_ACTIONS = Array.from(new Set(Object.values(MODULE_ACTIONS).flat()));

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ role, token, onSuccess }) => {
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [originalPermissions, setOriginalPermissions] = useState<PermissionState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch permissions on role change
  useEffect(() => {
    fetchPermissions();
  }, [role.id]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRolePermissions(role.id, token);

      // Initialize permission state
      const permState: PermissionState = {};
      
      // Load feature access permissions
      MODULES.forEach(module => {
        permState[module] = {};
        MODULE_ACTIONS[module].forEach(action => {
          const perm = data.permissionsByModule[module]?.find(p => p.action === action);
          permState[module][action] = perm?.isEnabled ?? false;
        });
      });

      // Load sidebar menu permissions from database (not from hardcoded roles)
      permState['sidebar'] = {};
      const sidebarPerms = data.permissionsByModule['sidebar'] || [];
      Object.entries(SIDEBAR_MENU_ITEMS).forEach(([key]) => {
        // Get permission from database
        const perm = sidebarPerms.find(p => p.action === key);
        // Use database value if exists, otherwise default to false
        permState['sidebar'][key] = perm?.isEnabled ?? false;
      });

      setPermissions(permState);
      setOriginalPermissions(JSON.parse(JSON.stringify(permState)));
      setHasChanges(false);
      setChangeReason('');
    } catch (err) {
      setError('Failed to fetch permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (module: string, action: string) => {
    const newPermissions = { ...permissions };
    newPermissions[module][action] = !newPermissions[module][action];
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!changeReason.trim()) {
      setError('Please provide a reason for the changes');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Build permission updates
      const updates: PermissionUpdate[] = [];
      
      // Check feature access permissions
      MODULES.forEach(module => {
        MODULE_ACTIONS[module].forEach(action => {
          if (permissions[module][action] !== originalPermissions[module][action]) {
            updates.push({
              module,
              action,
              isEnabled: permissions[module][action]
            });
          }
        });
      });

      // Check sidebar menu permissions
      Object.entries(SIDEBAR_MENU_ITEMS).forEach(([key]) => {
        if (permissions['sidebar']?.[key] !== originalPermissions['sidebar']?.[key]) {
          updates.push({
            module: 'sidebar',
            action: key,
            isEnabled: permissions['sidebar']?.[key] ?? false
          });
        }
      });

      if (updates.length === 0) {
        setError('No changes to save');
        return;
      }

      await updateRolePermissions(role.id, updates, changeReason, token);
      setSuccess(`Successfully updated ${updates.length} permission(s)`);
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
      setHasChanges(false);
      setChangeReason('');
      // Refetch permissions to ensure we have the latest state
      await fetchPermissions();
      onSuccess();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update permissions');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
      setHasChanges(false);
      setChangeReason('');
      setError(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 flex items-center justify-center">
        <Loader size={24} className="animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white capitalize">{role.name} Role</h3>
            {role.description && <p className="text-sm text-slate-400 mt-1">{role.description}</p>}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Permissions</p>
            <p className="text-2xl font-bold text-teal-400">{Object.values(permissions).reduce((sum, m) => sum + Object.values(m).filter(Boolean).length, 0)}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded p-3 text-red-200 text-sm mb-4">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded p-3 text-green-200 text-sm mb-4">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Change Reason */}
        {hasChanges && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Reason for Changes *</label>
            <textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., Security policy update, Role restructuring..."
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>
        )}

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !changeReason.trim()}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded transition text-sm font-medium"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-4 py-2 rounded transition text-sm font-medium"
            >
              <RotateCcw size={16} />
              Discard
            </button>
          </div>
        )}
      </div>

      {/* Section Header: Feature Access */}
      <div className="mt-6 mb-4">
        <h4 className="text-lg font-semibold text-white">Feature Access</h4>
        <p className="text-sm text-slate-400 mt-1">Control access to system features and modules</p>
      </div>

      {/* Permission Matrix */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-700/50">
              <th className="px-4 py-3 text-left font-semibold text-white">Module</th>
              {ALL_ACTIONS.map(action => (
                <th key={action} className="px-3 py-3 text-center font-semibold text-white capitalize">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {MODULES.map(module => (
              <tr key={module} className="hover:bg-slate-700/30 transition">
                <td className="px-4 py-3 font-medium text-white capitalize">{module}</td>
                {ALL_ACTIONS.map(action => {
                  const hasAction = MODULE_ACTIONS[module].includes(action);
                  return (
                    <td key={action} className="px-3 py-3 text-center">
                      {hasAction ? (
                        <button
                          onClick={() => handleToggle(module, action)}
                          disabled={saving}
                          className={`w-5 h-5 rounded border-2 transition ${
                            permissions[module]?.[action]
                              ? 'bg-teal-500 border-teal-500'
                              : 'bg-slate-600 border-slate-500 hover:border-slate-400'
                          } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {permissions[module]?.[action] && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section Header: Sidebar Menu Access */}
      <div className="mt-6 mb-4">
        <h4 className="text-lg font-semibold text-white">Sidebar Menu Access</h4>
        <p className="text-sm text-slate-400 mt-1">Control which menu items appear in the sidebar for this role</p>
      </div>

      {/* Sidebar Menu Grid */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(SIDEBAR_MENU_ITEMS).map(([key, item]) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded hover:bg-slate-700/50 transition">
              <button
                onClick={() => {
                  const newPermissions = { ...permissions };
                  if (!newPermissions['sidebar']) {
                    newPermissions['sidebar'] = {};
                  }
                  newPermissions['sidebar'][key] = !newPermissions['sidebar'][key];
                  setPermissions(newPermissions);
                  setHasChanges(true);
                }}
                disabled={saving}
                className={`w-5 h-5 rounded border-2 transition flex-shrink-0 ${
                  permissions['sidebar']?.[key]
                    ? 'bg-teal-500 border-teal-500'
                    : 'bg-slate-600 border-slate-500 hover:border-slate-400'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {permissions['sidebar']?.[key] && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <label className="text-sm text-white cursor-pointer flex-1">{item.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
        <p className="text-xs text-slate-400">
          <span className="inline-block w-4 h-4 bg-teal-500 rounded mr-2"></span>
          Enabled permission
          <span className="ml-4 inline-block w-4 h-4 bg-slate-600 rounded mr-2"></span>
          Disabled permission
        </p>
      </div>
    </div>
  );
};

export default PermissionMatrix;
