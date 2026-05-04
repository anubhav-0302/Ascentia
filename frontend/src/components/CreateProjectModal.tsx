import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { createProject, getAvailableEmployees, type CreateProjectData, type AvailableEmployee } from '../api/projectApi';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: any) => void;
  currentUserId: number;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserId
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState<number>(currentUserId);
  const [teamLeadId, setTeamLeadId] = useState<number | ''>('');
  const [status, setStatus] = useState('planning');
  const [priority, setPriority] = useState('medium');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
      const employees = await getAvailableEmployees();
      // Filter to only show managers, admins, and team leads for manager/team lead selection
      setAvailableEmployees(employees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setFetchingEmployees(false);
    }
  };

  // Filter employees by role for dropdowns
  // Manager dropdown: only managers and admins (not HR, not team leads)
  const managersAndAdmins = availableEmployees.filter(
    emp => emp.role === 'admin' || emp.role === 'manager'
  );

  // Team Lead dropdown: only team leads (not managers, not admins)
  const teamLeads = availableEmployees.filter(
    emp => emp.role === 'teamlead'
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
        status,
        priority,
        budget: budget ? Number(budget) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const project = await createProject(projectData);
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
    setStatus('planning');
    setPriority('medium');
    setBudget('');
    setStartDate('');
    setEndDate('');
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
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header - fixed */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
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
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable body */}
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Manager + Team Lead row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      Manager
                    </span>
                  </label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading || fetchingEmployees}
                  >
                    <option value="">Select...</option>
                    {managersAndAdmins.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Team Lead
                    </span>
                  </label>
                  <select
                    value={teamLeadId}
                    onChange={(e) => setTeamLeadId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading || fetchingEmployees}
                  >
                    <option value="">Select...</option>
                    {teamLeads.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {fetchingEmployees && (
                <p className="text-xs text-slate-500">Loading employees...</p>
              )}

              {/* Status + Priority row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Budget + Dates row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      Budget
                    </span>
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Start
                    </span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="p-5 border-t border-slate-700 flex-shrink-0">
              <div className="flex gap-3">
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
