import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, type LeaveRequest, type CreateLeaveRequest } from '../api/leaveApi';
import { useIsAdmin } from '../store/useAuthStore';
import { useNotificationStore, createLeaveNotification } from '../store/notificationStore';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import Card from './Card';
import { Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';

const LeaveAttendance = () => {
  const isAdmin = useIsAdmin();
  const { addNotification } = useNotificationStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyLeaves();
      setLeaves(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        setError('End date must be after or same as start date');
        toast.error('End date must be after or same as start date');
        return;
      }

      await createLeave(formData);
      setSuccess('Leave request submitted successfully!');
      toast.success('Leave request submitted successfully!');
      
      // Trigger notification for leave request
      const notification = createLeaveNotification('requested', 'You', formData.type);
      addNotification({
        ...notification,
        actionUrl: '/leave-attendance'
      });
      
      // Reset form and refresh list
      setFormData({ type: '', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      fetchMyLeaves();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
      toast.error(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Admin functions
  const fetchAllLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllLeaves();
      setLeaves(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch all leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (leaveId: number, status: 'Approved' | 'Rejected') => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateLeaveStatus(leaveId, status);
      setSuccess(`Leave request ${status.toLowerCase()} successfully!`);
      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      
      // Find the leave request to get employee name and type
      const leaveRequest = leaves.find(leave => leave.id === leaveId);
      if (leaveRequest) {
        const notification = createLeaveNotification(
          status.toLowerCase() as 'approved' | 'rejected', 
          leaveRequest.user?.name || 'Employee',
          leaveRequest.type
        );
        addNotification({
          ...notification,
          actionUrl: '/leave-attendance'
        });
      }
      
      // Refresh the list
      fetchAllLeaves();
    } catch (err: any) {
      setError(err.message || `Failed to ${status.toLowerCase()} leave request`);
      toast.error(err.message || `Failed to ${status.toLowerCase()} leave request`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appropriate data based on user role
  useEffect(() => {
    if (isAdmin) {
      fetchAllLeaves();
    } else {
      fetchMyLeaves();
    }
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <div className="text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Leave Management</h1>
            <p className="text-gray-400 text-sm">
              Review and manage all employee leave requests.
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-400 mr-3"></i>
                <p className="text-green-400">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-400 mr-3"></i>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Leave Requests Table */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-2xl font-semibold text-white">All Leave Requests</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-gray-400">Loading leave requests...</span>
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-12 text-center">
                <i className="fas fa-calendar-times text-4xl text-gray-500 mb-4"></i>
                <p className="text-gray-400 text-lg">No leave requests found</p>
                <p className="text-gray-500 text-sm mt-2">
                  When employees submit leave requests, they will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-700/40 transition-all duration-200 hover:scale-[1.01]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {leave.user?.name || 'Unknown Employee'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {leave.user?.email || 'No email'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{leave.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs">
                            {leave.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={leave.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {leave.status === 'Pending' && (
                              <>
                                <Button
                                  onClick={() => handleApproveReject(leave.id, 'Approved')}
                                  disabled={loading}
                                  size="sm"
                                  icon={<CheckCircle className="w-3 h-3" />}
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleApproveReject(leave.id, 'Rejected')}
                                  disabled={loading}
                                  variant="danger"
                                  size="sm"
                                  icon={<XCircle className="w-3 h-3" />}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {leave.status !== 'Pending' && (
                              <span className="text-sm text-gray-500">
                                {leave.status}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Employee view
  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Leave & Attendance</h1>
          <p className="text-gray-400 text-sm">
            Manage your leave requests and track your attendance history.
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-check-circle text-green-400 mr-3"></i>
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-400 mr-3"></i>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Leave Request Form */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Request Leave</h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              icon={<Plus className="w-4 h-4" />}
            >
              {showForm ? 'Hide Form' : 'New Request'}
            </Button>
          </div>

          {showForm && (
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                      Leave Type *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select leave type</option>
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Personal Leave">Personal Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Paternity Leave">Paternity Leave</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
                      Reason *
                    </label>
                    <Input
                      type="text"
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Brief reason for leave"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      icon={<Calendar className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate}
                      icon={<Calendar className="w-4 h-4" />}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Leave History */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Leave History</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <span className="ml-3 text-gray-400">Loading leave requests...</span>
            </div>
          ) : leaves.length === 0 ? (
            <Card className="p-12 text-center">
              <i className="fas fa-calendar-times text-4xl text-gray-500 mb-4"></i>
              <p className="text-gray-400 text-lg">No leave requests yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Submit your first leave request using the form above.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applied
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-700/40 transition-all duration-200 hover:scale-[1.01]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{leave.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">
                            {leave.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={leave.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">
                            {formatDate(leave.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveAttendance;