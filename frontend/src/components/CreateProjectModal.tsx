import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Briefcase } from 'lucide-react';
import { createProject, getAvailableEmployees, type CreateProjectData, type AvailableEmployee } from '../api/projectApi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  token: string;
  currentUserId: number;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  token,
  currentUserId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState<number>(currentUserId);
  const [teamLeadId, setTeamLeadId] = useState<number | ''>('');
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdProject, setCreatedProject] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableEmployees();
    }
  }, [isOpen]);

  const fetchAvailableEmployees = async () => {
    try {
      setFetchingEmployees(true);
      const employees = await getAvailableEmployees(token);
      // Filter to only show managers, admins, and team leads for manager/team lead selection
      setAvailableEmployees(employees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setFetchingEmployees(false);
    }
  };

  // Filter employees by role for dropdowns
  const managersAndAdmins = availableEmployees.filter(
    emp => emp.role === 'admin' || emp.role === 'manager' || emp.role === 'hr'
  );

  const teamLeads = availableEmployees.filter(
    emp => emp.role === 'teamlead' || emp.role === 'manager'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const projectData: CreateProjectData = {
        name: name.trim(),
        description: description.trim() || undefined,
        managerId: managerId || currentUserId,
        teamLeadId: teamLeadId ? Number(teamLeadId) : undefined,
      };

      const project = await createProject(projectData, token);
      setCreatedProject(project);
      setStep('success');
      onSuccess(project);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setName('');
    setDescription('');
    setManagerId(currentUserId);
    setTeamLeadId('');
    setError(null);
    setStep('form');
    setCreatedProject(null);
    onClose();
  };

  const handleAssignEmployees = () => {
    handleClose();
    // Signal to parent that we want to assign employees
    if (createdProject) {
      onSuccess({ ...createdProject, assignEmployees: true });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {step === 'form' ? 'Create New Project' : 'Project Created!'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description (optional)"
                rows={3}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                disabled={loading}
              />
            </div>

            {/* Manager Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Project Manager
                </span>
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                disabled={loading || fetchingEmployees}
              >
                <option value="">Select a manager...</option>
                {managersAndAdmins.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.jobTitle || emp.role})
                  </option>
                ))}
              </select>
              {fetchingEmployees && (
                <p className="text-xs text-slate-500 mt-1">Loading employees...</p>
              )}
            </div>

            {/* Team Lead Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Lead (Optional)
                </span>
              </label>
              <select
                value={teamLeadId}
                onChange={(e) => setTeamLeadId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                disabled={loading || fetchingEmployees}
              >
                <option value="">Select a team lead...</option>
                {teamLeads.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.jobTitle || emp.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
                disabled={loading || !name.trim()}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success Step */
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Project Created Successfully!
              </h3>
              <p className="text-slate-400">
                "{createdProject?.name}" has been created with {createdProject?.assignments?.length || 1} team member(s).
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Assign Later
              </button>
              <button
                onClick={handleAssignEmployees}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Assign Employees
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectModal;
