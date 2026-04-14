import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { StandardLayout } from './StandardLayout';
import { User, Mail, Calendar, MapPin, Briefcase, Building, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useAuthStore } from '../store/useAuthStore';
import { getMyLeaves, getAllLeaves, type LeaveRequest } from '../api/leaveApi';
import { useIsAdmin } from '../store/useAuthStore';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { EnhancedModal } from './EnhancedModal';
import { employeeApi, type Employee, type UpdateEmployeeRequest } from '../api/employeeApi';
import toast from 'react-hot-toast';

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { employees, fetchEmployees } = useEmployeeStore();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Find employee from store or fetch if not available
  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) return;
      
      setError(null); // Reset error state
      const employeeId = parseInt(id);
      if (isNaN(employeeId)) {
        setError('Invalid employee ID');
        setLoading(false);
        return;
      }
      
      // First check if employee exists in store
      let foundEmployee = employees.find(emp => emp.id === employeeId);
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
        setLoading(false);
        return;
      }
      
      // If not found, try direct API call first (more efficient)
      try {
        const response = await employeeApi.getEmployee(employeeId);
        // Handle API response format: { success: true, data: employee }
        if (response && response.data) {
          setEmployee(response.data);
        } else if (response) {
          setEmployee(response);
        } else {
          setError('Employee not found');
        }
      } catch (error: any) {
        console.error('Direct API call failed, trying to fetch all employees:', error);
        
        // If direct call fails, try fetching all employees and then finding the employee
        try {
          await fetchEmployees();
          // Wait a bit for state to update
          setTimeout(() => {
            const updatedEmployee = employees.find(emp => emp.id === employeeId);
            if (updatedEmployee) {
              setEmployee(updatedEmployee);
            } else {
              setError('Employee not found');
            }
            setLoading(false);
          }, 100);
          return; // Exit early since we're handling setLoading in setTimeout
        } catch (fetchError) {
          console.error('Failed to fetch employees:', fetchError);
          setError('Failed to load employee data');
        }
      }
      
      setLoading(false);
    };

    loadEmployee();
  }, [id, location.key]); // Add location.key to handle browser back/forward navigation

  // Handle browser navigation (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      // Reset states and reload data when browser navigation occurs
      setEmployee(null);
      setError(null);
      setLoading(true);
      setLeaveData([]);
      setLeaveLoading(true);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Load leave data for the employee
  useEffect(() => {
    const loadLeaveData = async () => {
      if (!employee) return;
      
      setLeaveLoading(true);
      try {
        // If viewing own profile, use my leaves, otherwise use all leaves and filter
        if (user?.id === employee.id) {
          const response = await getMyLeaves();
          // Handle API response format
          if (response && response.data) {
            setLeaveData(response.data);
          } else {
            setLeaveData(response || []);
          }
        } else if (isAdmin) {
          const response = await getAllLeaves();
          // Handle API response format
          const allLeaves = response && response.data ? response.data : (response || []);
          const employeeLeaves = allLeaves.filter((leave: LeaveRequest) => 
            leave.user && leave.user.id === employee.id
          );
          setLeaveData(employeeLeaves);
        }
      } catch (error) {
        console.error('Failed to load leave data:', error);
        setLeaveData([]); // Set empty array on error
      } finally {
        setLeaveLoading(false);
      }
    };

    loadLeaveData();
  }, [employee, user, isAdmin]);

  // Memoized leave statistics
  const leaveStats = useMemo(() => {
    const total = leaveData.length;
    const pending = leaveData.filter(leave => leave.status === 'Pending').length;
    const approved = leaveData.filter(leave => leave.status === 'Approved').length;
    const rejected = leaveData.filter(leave => leave.status === 'Rejected').length;
    
    return { total, pending, approved, rejected };
  }, [leaveData]);

  // Recent leave requests (last 5)
  const recentLeaves = useMemo(() => {
    return leaveData
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [leaveData]);

  const handleEditEmployee = () => {
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async () => {
    if (!employee || !window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      return;
    }

    try {
      await employeeApi.deleteEmployee(employee.id);
      toast.success('Employee deleted successfully');
      navigate('/directory');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete employee');
    }
  };

  const handleUpdateEmployee = async (data: UpdateEmployeeRequest) => {
    if (!employee) return;
    
    setEditLoading(true);
    try {
      await employeeApi.updateEmployee(employee.id, data);
      toast.success('Employee updated successfully');
      setShowEditModal(false);
      await fetchEmployees(); // Refresh employee data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <StandardLayout title="Employee Profile" description="Loading employee information...">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading employee information...</p>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <StandardLayout title="Error" description="An error occurred while loading the employee profile">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Error: {error}</p>
            <p className="text-gray-500 text-sm mb-6">Please try again or contact support if the problem persists.</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
              <Button onClick={() => navigate('/directory')} variant="secondary" className="mt-4">
                Back to Directory
              </Button>
            </div>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  if (!employee) {
    return (
      <PageTransition>
        <StandardLayout title="Employee Not Found" description="The requested employee could not be found">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Employee not found</p>
            <Button onClick={() => navigate('/directory')} className="mt-4">
              Back to Directory
            </Button>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  const isOwnProfile = user?.id === employee.id;

  return (
    <PageTransition>
      <StandardLayout 
        title={employee.name}
        description={`${employee.jobTitle} • ${employee.department}`}
      >
        <FadeIn delay={100}>
          <div className="space-y-6">
            {/* Header Section */}
            <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-400">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-white">{employee.name}</h1>
                    <p className="text-teal-400 font-medium">{employee.jobTitle}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <StatusBadge status={employee.status} />
                      <span className="text-gray-400 text-sm">{employee.role}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {(isAdmin || isOwnProfile) && (
                    <Button onClick={handleEditEmployee} variant="secondary">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {isAdmin && !isOwnProfile && (
                    <Button onClick={handleDeleteEmployee} variant="danger">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-teal-400" />
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <p className="text-white">{employee.name || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <p className="text-white">{employee.email || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                      <p className="text-white">{employee.jobTitle || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                      <p className="text-white">{employee.department || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                      <p className="text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.location || 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Employee ID</label>
                      <p className="text-white">#{employee.id}</p>
                    </div>
                  </div>
                </Card>

                {/* Work Info Section */}
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-teal-400" />
                    Work Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                      <p className="text-white">{employee.role || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                      <StatusBadge status={employee.status} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                      <p className="text-white flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Last Login</label>
                      <p className="text-white flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {employee.lastLogin ? new Date(employee.lastLogin).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Leave Summary Section */}
              <div className="space-y-6">
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-teal-400" />
                    Leave Summary
                  </h2>
                  
                  {leaveLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                      <p className="text-gray-400 text-sm mt-2">Loading leave data...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-teal-400">{leaveStats.total}</p>
                          <p className="text-gray-400 text-sm">Total Requests</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-yellow-400">{leaveStats.pending}</p>
                          <p className="text-gray-400 text-sm">Pending</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-green-400">{leaveStats.approved}</p>
                          <p className="text-gray-400 text-sm">Approved</p>
                        </div>
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                          <p className="text-2xl font-bold text-red-400">{leaveStats.rejected}</p>
                          <p className="text-gray-400 text-sm">Rejected</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Recent Leave History */}
                {recentLeaves.length > 0 && (
                  <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Leave History</h3>
                    <div className="space-y-3">
                      {recentLeaves.map((leave) => (
                        <div key={leave.id} className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{leave.type}</p>
                              <p className="text-gray-400 text-sm">
                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <StatusBadge status={leave.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </StandardLayout>

      {/* Edit Modal */}
      <EnhancedModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit ${employee.name}`}
      >
        <EmployeeEditForm
          employee={employee}
          onSave={handleUpdateEmployee}
          onCancel={() => setShowEditModal(false)}
          loading={editLoading}
        />
      </EnhancedModal>
    </PageTransition>
  );
};

// Employee Edit Form Component
interface EmployeeEditFormProps {
  employee: Employee;
  onSave: (data: UpdateEmployeeRequest) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  employee,
  onSave,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState<UpdateEmployeeRequest>({
    name: employee.name,
    email: employee.email,
    jobTitle: employee.jobTitle,
    department: employee.department,
    location: employee.location,
    status: employee.status,
    role: employee.role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
        <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
        <input
          type="text"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="hr">HR</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default EmployeeProfile;
