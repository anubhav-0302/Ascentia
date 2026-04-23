import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '../api/orgApi';
import type { Organization } from '../api/orgApi';

interface OrganizationManagementProps {
  token: string;
}

const OrganizationManagement: React.FC<OrganizationManagementProps> = ({ token }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', subscriptionPlan: 'free' });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await getOrganizations(token);
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOrg(null);
    setFormData({ name: '', code: '', subscriptionPlan: 'free' });
    setShowModal(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ name: org.name, code: org.code || '', subscriptionPlan: org.subscriptionPlan });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      await deleteOrganization(id, token);
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, formData, token);
      } else {
        await createOrganization(formData, token);
      }
      setShowModal(false);
      fetchOrganizations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving organization');
    }
  };

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="text-teal-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Organization Management</h2>
              <p className="text-sm text-slate-400">Create and manage organizations</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition"
          >
            <Plus size={16} />
            New Organization
          </button>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-300">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-300">Code</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-300">Plan</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-300">Employees</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-300">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-slate-700/50">
                <td className="px-6 py-4 text-white font-medium">{org.name}</td>
                <td className="px-6 py-4 text-slate-300">{org.code || '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded text-xs bg-slate-600 text-slate-300">
                    {org.subscriptionPlan}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {org._count?.employees || 0}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    org.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(org)}
                      className="p-1 hover:bg-slate-600 rounded transition"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-yellow-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="p-1 hover:bg-slate-600 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingOrg ? 'Edit Organization' : 'New Organization'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="Organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="Unique code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Plan</label>
                <select
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
