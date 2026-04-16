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

const MODULES = [
  'payroll',
  'performance',
  'timesheet',
  'leave',
  'employees',
  'documents',
  'reports',
  'audit',
  'settings',
  'users',
  'kra'
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve'];

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
      MODULES.forEach(module => {
        permState[module] = {};
        ACTIONS.forEach(action => {
          const perm = data.permissionsByModule[module]?.find(p => p.action === action);
          permState[module][action] = perm?.isEnabled ?? false;
        });
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
      MODULES.forEach(module => {
        ACTIONS.forEach(action => {
          if (permissions[module][action] !== originalPermissions[module][action]) {
            updates.push({
              module,
              action,
              isEnabled: permissions[module][action]
            });
          }
        });
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

      {/* Permission Matrix */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-700/50">
              <th className="px-4 py-3 text-left font-semibold text-white">Module</th>
              {ACTIONS.map(action => (
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
                {ACTIONS.map(action => (
                  <td key={`${module}-${action}`} className="px-3 py-3 text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[module]?.[action] ?? false}
                        onChange={() => handleToggle(module, action)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 accent-teal-500 cursor-pointer"
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
