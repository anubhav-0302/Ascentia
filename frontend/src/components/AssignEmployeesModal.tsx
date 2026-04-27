import React, { useState, useEffect } from 'react';
import { X, Users, Check, UserPlus, Search } from 'lucide-react';
import { assignEmployees, getAvailableEmployees, getProjectMembers, type AvailableEmployee, type ProjectMember } from '../api/projectApi';

interface AssignEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  projectName: string;
  token: string;
}

interface SelectedEmployee {
  employeeId: number;
  role: 'member' | 'contributor';
}

const AssignEmployeesModal: React.FC<AssignEmployeesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectName,
  token
}) => {
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([]);
  const [currentMembers, setCurrentMembers] = useState<ProjectMember[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<SelectedEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchData();
    }
  }, [isOpen, projectId]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setError(null);

      // Fetch available employees (excluding those already assigned)
      const [available, members] = await Promise.all([
        getAvailableEmployees(token, projectId),
        getProjectMembers(projectId, token)
      ]);

      setAvailableEmployees(available);
      setCurrentMembers(members);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployees(prev => {
      const existing = prev.find(se => se.employeeId === employeeId);
      if (existing) {
        return prev.filter(se => se.employeeId !== employeeId);
      } else {
        return [...prev, { employeeId, role: 'member' }];
      }
    });
  };

  const updateEmployeeRole = (employeeId: number, role: 'member' | 'contributor') => {
    setSelectedEmployees(prev =>
      prev.map(se =>
        se.employeeId === employeeId ? { ...se, role } : se
      )
    );
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      setError('Please select at least one employee');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const assignments = selectedEmployees.map(se => ({
        employeeId: se.employeeId,
        role: se.role,
        allocation: se.role === 'member' ? 50 : 25
      }));

      console.log('📤 Assigning employees:', { projectId, assignments });
      await assignEmployees(projectId, assignments, token);
      console.log('✅ Employees assigned successfully');

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('❌ Failed to assign employees:', err);
      setError(err.message || 'Failed to assign employees');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployees([]);
    setSearchQuery('');
    setError(null);
    onClose();
  };

  // Filter available employees by search query
  const filteredEmployees = availableEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if employee is selected
  const isSelected = (employeeId: number) =>
    selectedEmployees.some(se => se.employeeId === employeeId);

  // Get role for selected employee
  const getSelectedRole = (employeeId: number) =>
    selectedEmployees.find(se => se.employeeId === employeeId)?.role || 'member';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-400" />
              Assign Employees
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              to "{projectName}"
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Current Members */}
          {currentMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Current Team ({currentMembers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentMembers.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                    {member.employee.name}
                    <span className="text-xs text-slate-500">({member.role})</span>
                  </div>
                ))}
                {currentMembers.length > 5 && (
                  <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-500">
                    +{currentMembers.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees by name, email, or department..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                disabled={fetching}
              />
            </div>
          </div>

          {/* Available Employees List */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Available Employees ({filteredEmployees.length})
            </h3>

            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                <span className="ml-2 text-slate-400">Loading...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No available employees found</p>
                <p className="text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'All employees are already assigned to this project'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => toggleEmployeeSelection(employee.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected(employee.id)
                        ? 'bg-teal-500/20 border-teal-500/50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          isSelected(employee.id)
                            ? 'bg-teal-500 border-teal-500'
                            : 'border-slate-600'
                        }`}>
                          {isSelected(employee.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{employee.name}</p>
                          <p className="text-xs text-slate-400">
                            {employee.jobTitle || employee.role} • {employee.department || 'No department'}
                          </p>
                        </div>
                      </div>

                      {isSelected(employee.id) && (
                        <select
                          value={getSelectedRole(employee.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateEmployeeRole(employee.id, e.target.value as 'member' | 'contributor')}
                          className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="member">Member (50%)</option>
                          <option value="contributor">Contributor (25%)</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Count */}
          {selectedEmployees.length > 0 && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
              <p className="text-sm text-teal-400">
                {selectedEmployees.length} employee(s) selected for assignment
              </p>
            </div>
          )}

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
              onClick={handleAssign}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
              disabled={loading || selectedEmployees.length === 0}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Assign {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeesModal;
