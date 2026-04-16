import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { getRoles, createCustomRole, deleteCustomRole, type Role } from '../api/roleManagementApi';
import PermissionMatrix from './PermissionMatrix';
import PermissionAuditLog from './PermissionAuditLog';

interface RoleManagementProps {
  token: string;
}

type TabType = 'roles' | 'audit';

const RoleManagement: React.FC<RoleManagementProps> = ({ token }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('roles');

  // Fetch roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRoles(token);
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createCustomRole(newRoleName, newRoleDescription, token);
      setSuccess('Custom role created successfully');
      setNewRoleName('');
      setNewRoleDescription('');
      setShowCreateModal(false);
      await fetchRoles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to create role');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the custom role "${roleName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteCustomRole(roleId, token);
      setSuccess('Custom role deleted successfully');
      setRoles(roles.filter(r => r.id !== roleId));
      if (selectedRole?.id === roleId) {
        setSelectedRole(roles[0] || null);
      }
      await fetchRoles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete role');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Role Management</h2>
          <p className="text-slate-400 mt-1">Configure roles and permissions for your organization</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          New Role
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'roles'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'audit'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Audit Log
        </button>
      </div>

      {/* Content */}
      {activeTab === 'roles' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="bg-slate-700/50 px-4 py-3 border-b border-slate-700">
                <h3 className="font-semibold text-white">Roles ({roles.length})</h3>
              </div>
              <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                {loading && roles.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader size={24} className="animate-spin text-teal-400" />
                  </div>
                ) : (
                  roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={`w-full text-left px-4 py-3 transition ${
                        selectedRole?.id === role.id
                          ? 'bg-teal-500/20 border-l-2 border-teal-500'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate capitalize">{role.name}</p>
                          <p className="text-xs text-slate-400 mt-1">{role.permissionCount} permissions</p>
                          {role.isCustom && (
                            <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        {role.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id, role.name);
                            }}
                            className="text-red-400 hover:text-red-300 transition"
                            title="Delete role"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="lg:col-span-3">
            {selectedRole ? (
              <PermissionMatrix role={selectedRole} token={token} onSuccess={fetchRoles} />
            ) : (
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 flex items-center justify-center">
                <p className="text-slate-400">Select a role to view and manage permissions</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <PermissionAuditLog token={token} />
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Create Custom Role</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role Name *</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., department-head"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="e.g., Department head with team management access"
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoleName('');
                  setNewRoleDescription('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
