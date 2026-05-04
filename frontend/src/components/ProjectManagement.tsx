import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  UserPlus,
  UserMinus,
  CheckCircle,
  AlertCircle,
  Loader,
  X
} from 'lucide-react';
import {
  getProjects,
  updateProject,
  deleteProject,
  removeEmployee,
  getAvailableEmployees,
  type Project
} from '../api/projectApi';
import CreateProjectModal from './CreateProjectModal';
import AssignEmployeesModal from './AssignEmployeesModal';
import { useAuthStore } from '../store/useAuthStore';

const ProjectManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const currentUserId = user?.id || 0;
  const userRole = user?.role || '';
  const canModify = ['admin', 'hr'].includes(userRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New simplified modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [projectToAssign, setProjectToAssign] = useState<Project | null>(null);

  // Legacy modal states (keep for edit functionality)
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  // Form data for edit (includes all updatable fields)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: 0,
    teamLeadId: null as number | null,
    status: 'planning' as string,
    priority: 'medium' as string,
    budget: '' as string,
    startDate: '' as string,
    endDate: '' as string
  });
  const [editAvailableEmployees, setEditAvailableEmployees] = useState<any[]>([]);
  const [editModalLoading, setEditModalLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch available employees for edit modal
  const fetchEditAvailableEmployees = async (excludeProjectId?: number) => {
    try {
      const employees = await getAvailableEmployees(excludeProjectId);
      setEditAvailableEmployees(employees);
      return employees;
    } catch (err) {
      console.error('Failed to fetch employees for edit:', err);
      return [];
    }
  };

  // Get edit modal dropdown options
  // Manager dropdown: show managers/admins + always include current manager
  const getEditManagerOptions = () => {
    const roleFiltered = editAvailableEmployees.filter(
      (emp: any) => emp.role === 'manager' || emp.role === 'admin'
    );
    const options = [...roleFiltered];

    // Always include current project manager even if not in filtered list
    if (selectedProject && formData.managerId) {
      const hasCurrent = options.some((emp: any) => emp.id === formData.managerId);
      if (!hasCurrent) {
        // Use project.manager data (only has id, name, email from API)
        const mgr = selectedProject.manager;
        if (mgr && mgr.id === formData.managerId) {
          options.unshift({
            id: mgr.id,
            name: mgr.name,
            email: mgr.email,
            jobTitle: '',
            role: 'manager'
          });
        }
      }
    }
    return options;
  };

  // Team Lead dropdown: show teamleads + always include current team lead
  const getEditTeamLeadOptions = () => {
    const roleFiltered = editAvailableEmployees.filter(
      (emp: any) => emp.role === 'teamlead'
    );
    const options = [...roleFiltered];

    // Always include current team lead even if not in filtered list
    if (selectedProject && formData.teamLeadId) {
      const hasCurrent = options.some((emp: any) => emp.id === formData.teamLeadId);
      if (!hasCurrent) {
        // Find lead from current assignments (exclude manager who is auto-assigned as lead)
        const leadAssignment = selectedProject.assignments.find(
          (a: any) => a.role === 'lead' && a.employeeId === formData.teamLeadId && a.employeeId !== selectedProject.managerId
        );
        if (leadAssignment?.employee) {
          options.unshift({
            id: leadAssignment.employee.id,
            name: leadAssignment.employee.name,
            email: leadAssignment.employee.email,
            jobTitle: leadAssignment.employee.jobTitle || '',
            role: 'teamlead'
          });
        }
      }
    }
    return options;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };


  // New simplified handlers for the new modals
  const handleProjectCreated = (project: any) => {
    setSuccess('Project created successfully');
    setShowCreateModal(false);
    fetchProjects();

    // If user chose to assign employees immediately
    if (project.assignEmployees) {
      setProjectToAssign(project);
      setShowAssignModal(true);
    }

    setTimeout(() => setSuccess(null), 3000);
  };

  const handleOpenAssignModal = (project: Project) => {
    setProjectToAssign(project);
    setShowAssignModal(true);
  };

  const handleEmployeesAssigned = () => {
    setSuccess('Employees assigned successfully');
    setShowAssignModal(false);
    setProjectToAssign(null);
    fetchProjects();
    setTimeout(() => setSuccess(null), 3000);
  };

  // Legacy handlers (kept for edit/update/delete functionality)
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);
      await updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description || undefined,
        managerId: formData.managerId || undefined,
        teamLeadId: formData.teamLeadId,
        status: formData.status,
        priority: formData.priority,
        budget: formData.budget ? Number(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      });
      setSuccess('Project updated successfully');
      setShowEditModal(false);
      setSelectedProject(null);
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setLoading(true);
      await deleteProject(id);
      setSuccess('Project deleted successfully');
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEmployee = async (projectId: number, employeeId: number) => {
    if (!confirm('Remove this employee from the project?')) return;
    
    try {
      await removeEmployee(projectId, employeeId);
      setSuccess('Employee removed from project');
      fetchProjects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove employee');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'planning': return 'text-blue-400 bg-blue-400/20';
      case 'on-hold': return 'text-yellow-400 bg-yellow-400/20';
      case 'completed': return 'text-gray-400 bg-gray-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Project Management</h1>
          <p className="text-gray-400">Manage projects and assign team members</p>
        </div>

        <div className="flex items-center gap-4">
          {canModify && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition whitespace-nowrap"
            >
              <Plus size={20} />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded p-3 text-red-200">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded p-3 text-green-200">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {loading && projects.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-teal-400" size={32} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p>No projects found</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-gray-400 mb-3">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{project.teamSize || project.assignments.length} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No start date'} - 
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                        </span>
                      </div>
                      {project.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} />
                          <span>${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canModify && (
                      <button
                        onClick={async () => {
                          setSelectedProject(project);
                          const teamLeadAssignment = project.assignments.find(
                            a => a.role === 'lead' && a.employeeId !== project.managerId
                          );
                          setFormData({
                            name: project.name,
                            description: project.description || '',
                            managerId: project.managerId,
                            teamLeadId: teamLeadAssignment?.employeeId || null,
                            status: project.status,
                            priority: project.priority,
                            budget: project.budget?.toString() || '',
                            startDate: project.startDate ? project.startDate.split('T')[0] : '',
                            endDate: project.endDate ? project.endDate.split('T')[0] : ''
                          });
                          setEditModalLoading(true);
                          setShowEditModal(true);
                          await fetchEditAvailableEmployees(project.id);
                          setEditModalLoading(false);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {canModify && (
                      <button
                        onClick={() => handleOpenAssignModal(project)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition"
                        title="Assign Employees"
                      >
                        <UserPlus size={18} />
                      </button>
                    )}
                    {canModify && (
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded transition"
                    >
                      {expandedProject === project.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded View */}
                {expandedProject === project.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Project Manager</h4>
                      <p className="text-white">{project.manager.name} ({project.manager.email})</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Team Members</h4>
                      <div className="space-y-2">
                        {project.assignments
                          .filter(assignment => assignment.employeeId !== project.managerId)
                          .map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
                              <div>
                                <p className="text-white font-medium">{assignment.employee.name}</p>
                                <p className="text-gray-400 text-sm">
                                  {assignment.employee.jobTitle} • {assignment.role}
                                  {assignment.allocation && ` • ${assignment.allocation}% allocation`}
                                </p>
                              </div>
                              {canModify && (
                                <button
                                  onClick={() => handleRemoveEmployee(project.id, assignment.employeeId)}
                                  className="p-1 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded transition"
                                >
                                  <UserMinus size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        {project.assignments.filter(a => a.employeeId !== project.managerId).length === 0 && (
                          <p className="text-gray-500 text-sm">No team members assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            {/* Header - fixed */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white">Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProject(null);
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable body */}
              <div className="p-5 space-y-3 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                    disabled={loading}
                  />
                </div>
                {editModalLoading && (
                  <div className="flex items-center justify-center py-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mr-2" />
                    Loading employees...
                  </div>
                )}
                {/* Manager + Team Lead row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        Manager
                      </span>
                    </label>
                    <select
                      value={formData.managerId || ''}
                      onChange={(e) => setFormData({ ...formData, managerId: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50 text-sm"
                      required
                      disabled={editModalLoading || loading}
                    >
                      <option value="">Select...</option>
                      {getEditManagerOptions().map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        Team Lead
                      </span>
                    </label>
                    <select
                      value={formData.teamLeadId || ''}
                      onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value ? Number(e.target.value) : null })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 disabled:opacity-50 text-sm"
                      disabled={editModalLoading || loading}
                    >
                      <option value="">Select...</option>
                      {getEditTeamLeadOptions().map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Status + Priority row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                        <DollarSign size={14} />
                        Budget
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-sm"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Start
                      </span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500 text-sm"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">End</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedProject(null);
                    }}
                    className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Update Project'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Simplified Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleProjectCreated}
        currentUserId={currentUserId}
      />

      {/* New Assign Employees Modal */}
      <AssignEmployeesModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setProjectToAssign(null);
        }}
        onSuccess={handleEmployeesAssigned}
        projectId={projectToAssign?.id || 0}
        projectName={projectToAssign?.name || ''}
      />
    </div>
  );
};

export default ProjectManagement;
