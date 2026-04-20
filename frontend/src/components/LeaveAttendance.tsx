import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, cancelLeave, type LeaveRequest, type CreateLeaveRequest } from '../api/leaveApi';
import { useIsAdmin } from '../store/useAuthStore';
import { useNotificationStore, createLeaveNotification } from '../store/notificationStore';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import Card from './Card';
import LeaveCalendar from './LeaveCalendar';
import UnifiedDropdown from './UnifiedDropdown';
import { Calendar, CheckCircle, XCircle, Plus, XOctagon, CalendarX, AlertTriangle, Search, Filter, Clock } from 'lucide-react';

const LeaveAttendance = () => {
  const isAdmin = useIsAdmin();
  const { addNotification } = useNotificationStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Admin filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    type: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date in local timezone
    endDate: '',
    reason: ''
  });

  // Fetch leave requests on component mount
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
    
    // Validate form data
    if (!formData.type || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate dates using local timezone
    const start = new Date(formData.startDate + 'T00:00:00');
    const end = new Date(formData.endDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }
    
    if (end < start) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate leave quota
      const requestedDays = calculateDuration(formData.startDate, formData.endDate);
      const leaveTypeBalance = leaveBalance.find(b => b.type === formData.type);
      
      if (leaveTypeBalance && requestedDays > leaveTypeBalance.remaining) {
        setError(`Insufficient ${formData.type} balance. You have ${leaveTypeBalance.remaining} days remaining but requesting ${requestedDays} days.`);
        toast.error(`Insufficient ${formData.type} balance. You have ${leaveTypeBalance.remaining} days remaining but requesting ${requestedDays} days.`);
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
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-clear endDate if startDate moves forward past it
      if (name === 'startDate' && prev.endDate && value > prev.endDate) {
        updated.endDate = '';
      }
      // Clamp endDate to startDate if user manually types an earlier date
      if (name === 'endDate' && prev.startDate && value < prev.startDate) {
        updated.endDate = prev.startDate;
      }
      return updated;
    });
  };

  // Handle leave type change with validation
  const handleLeaveTypeChange = (value: string | number) => {
    setFormData(prev => ({
      ...prev,
      type: String(value)
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate leave duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    // Use local timezone to avoid date shifting
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  // Get duration for current form dates
  const formDuration = useMemo(() => {
    if (formData.startDate && formData.endDate) {
      return calculateDuration(formData.startDate, formData.endDate);
    }
    return 0;
  }, [formData.startDate, formData.endDate]);
  
  // Calculate leave balance for employee
  const leaveBalance = useMemo(() => {
    // Include both Approved and Pending leaves in balance calculation
    const approvedAndPendingLeaves = leaves.filter(leave => 
      leave.status === 'Approved' || leave.status === 'Pending'
    );
    
    // Standard annual leave quotas (can be made configurable)
    const quotas = {
      'Annual Leave': 21,
      'Sick Leave': 10,
      'Personal Leave': 5,
      'Maternity Leave': 90,
      'Paternity Leave': 14
    };
    
    const used = approvedAndPendingLeaves.reduce((acc, leave) => {
      const duration = calculateDuration(leave.startDate, leave.endDate);
      acc[leave.type] = (acc[leave.type] || 0) + duration;
      return acc;
    }, {} as Record<string, number>);
    
    // Only show up to Paternity Leave
    const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave'];
    
    const balance = leaveTypes.map(type => {
      const total = quotas[type as keyof typeof quotas];
      const usedDays = used[type as keyof typeof used] || 0;
      const remaining = Math.max(0, total - usedDays); // Prevent negative balance
      
      return {
        type,
        total,
        used: usedDays,
        remaining
      };
    });
    
    return balance;
  }, [leaves]);

  // Filter leaves for admin view
  const filteredLeaves = useMemo(() => {
    let filtered = leaves;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(leave => 
        leave.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [leaves, statusFilter, searchTerm]);

  // Get statistics
  const stats = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length
  }), [leaves]);

  // Cancel leave request (employee)
  const handleCancelLeave = async (leaveId: number) => {
    try {
      setActionLoading(leaveId);
      await cancelLeave(leaveId);
      toast.success('Leave request cancelled successfully!');
      fetchMyLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel leave request');
    } finally {
      setActionLoading(null);
    }
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
      setActionLoading(leaveId);
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
      setActionLoading(null);
    }
  };

  // Auto-dismiss success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Fetch appropriate data based on user role (single effect, no duplicate calls)
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
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Leave Management</h1>
            <p className="text-gray-400 text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></span>
              Review and manage all employee leave requests.
              {stats.pending > 0 && (
                <span className="ml-3 text-yellow-400 font-medium">
                  {stats.pending} pending {stats.pending === 1 ? 'request' : 'requests'}
                </span>
              )}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <div className="group bg-gradient-to-br from-slate-800/40 to-slate-800/20 backdrop-blur-lg border border-slate-700/30 rounded-2xl p-4 lg:p-6 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Total Requests</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">{stats.total}</p>
                </div>
                <div className="bg-blue-500/20 p-4 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="group bg-gradient-to-br from-slate-800/40 to-slate-800/20 backdrop-blur-lg border border-slate-700/30 rounded-2xl p-4 lg:p-6 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Pending</p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300">{stats.pending}</p>
                </div>
                <div className="bg-yellow-500/20 p-4 rounded-xl group-hover:bg-yellow-500/30 transition-colors duration-300">
                  <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
                </div>
              </div>
              {stats.pending > 0 && (
                <div className="mt-3 text-xs text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Action required</span>
                </div>
              )}
            </div>
            <div className="group bg-gradient-to-br from-slate-800/40 to-slate-800/20 backdrop-blur-lg border border-slate-700/30 rounded-2xl p-4 lg:p-6 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Approved</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">{stats.approved}</p>
                </div>
                <div className="bg-green-500/20 p-4 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                  <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" />
                </div>
              </div>
            </div>
            <div className="group bg-gradient-to-br from-slate-800/40 to-slate-800/20 backdrop-blur-lg border border-slate-700/30 rounded-2xl p-4 lg:p-6 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">Rejected</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-400 group-hover:text-red-300 transition-colors duration-300">{stats.rejected}</p>
                </div>
                <div className="bg-red-500/20 p-4 rounded-xl group-hover:bg-red-500/30 transition-colors duration-300">
                  <XCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by employee, type, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 bg-slate-700/40 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 w-full sm:w-80 transition-all duration-200"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  icon={<Filter className="w-4 h-4" />}
                  className="hover:bg-teal-500/10 hover:border-teal-500/30 transition-all duration-200 w-full sm:w-auto justify-center"
                >
                  Filters {statusFilter !== 'all' || searchTerm ? `(${filteredLeaves.length})` : ''}
                </Button>
              </div>
              {(statusFilter !== 'all' || searchTerm) && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  variant="secondary"
                  size="sm"
                  className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-200 w-full sm:w-auto justify-center"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            {showFilters && (
              <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-center space-x-4">
                  <UnifiedDropdown
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as string)}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Approved', label: 'Approved' },
                      { value: 'Rejected', label: 'Rejected' }
                    ]}
                    showLabel={false}
                    size="md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <p className="text-green-400">{success}</p>
                </div>
                <button
                  onClick={() => setSuccess(null)}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                  <p className="text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Leave Requests Table */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-teal-400" />
                All Leave Requests
                <span className="ml-3 text-sm text-gray-400 font-normal">
                  ({filteredLeaves.length} {filteredLeaves.length === 1 ? 'request' : 'requests'})
                </span>
              </h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-3 text-gray-400">Loading leave requests...</span>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarX className="w-16 h-16 text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">No leave requests found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'When employees submit leave requests, they will appear here.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredLeaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-slate-700/30 transition-all duration-300 hover:scale-[1.01]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={`https://picsum.photos/seed/${leave.user?.id || leave.id}/32/32.jpg`}
                              alt={leave.user?.name || 'Employee'}
                              className="w-8 h-8 rounded-full mr-3 ring-2 ring-slate-700"
                            />
                            <div>
                              <div className="text-sm font-medium text-white hover:text-teal-400 transition-colors duration-200">
                                {leave.user?.name || 'Unknown Employee'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {leave.user?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-gray-300">
                            {leave.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {calculateDuration(leave.startDate, leave.endDate)} days
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs hover:text-white transition-colors duration-200">
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
                                  disabled={actionLoading === leave.id}
                                  loading={actionLoading === leave.id}
                                  size="sm"
                                  icon={<CheckCircle className="w-3 h-3" />}
                                  className="hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-200"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleApproveReject(leave.id, 'Rejected')}
                                  disabled={actionLoading === leave.id}
                                  loading={actionLoading === leave.id}
                                  variant="danger"
                                  size="sm"
                                  icon={<XCircle className="w-3 h-3" />}
                                  className="hover:bg-red-500/20 transition-all duration-200"
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
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Leave & Attendance</h1>
          <p className="text-gray-400 text-sm flex items-center">
            <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></span>
            Manage your leave requests and track your attendance history.
          </p>
        </div>

        {/* Unified Calendar with Leave Balance */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-hidden mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row">
            {/* Calendar Section */}
            <div className="flex-1 p-4 border-b lg:border-b-0 lg:border-r border-slate-700/30">
              <LeaveCalendar 
                leaves={leaves}
                onDateSelect={(startDate, endDate) => {
                  setFormData(prev => ({ ...prev, startDate, endDate }));
                  setShowForm(true);
                }}
                onClear={() => {
                  setFormData(prev => ({ ...prev, startDate: '', endDate: '' }));
                }}
              />
            </div>
            
            {/* Leave Balance Section */}
            <div className="lg:w-80 p-4 bg-slate-800/20">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" /> Leave Balance
              </h3>
              <div className="space-y-3">
                {leaveBalance.map((balance) => (
                  <div key={balance.type} className="group">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-white font-medium w-28 shrink-0 group-hover:text-teal-400 transition-colors duration-200">{balance.type}</span>
                      <div className="flex items-center gap-1 text-xs shrink-0">
                        <span className="text-gray-400">{balance.used}/{balance.total}</span>
                        <span className={`font-semibold px-2 py-0.5 rounded-full ${
                          balance.remaining <= 2 ? 'bg-red-500/20 text-red-400' :
                          balance.remaining <= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>{balance.remaining}d</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 hover:opacity-80 ${
                          (balance.used / balance.total) >= 0.9 ? 'bg-red-500' :
                          (balance.used / balance.total) >= 0.7 ? 'bg-yellow-500' :
                          'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min((balance.used / balance.total) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <p className="text-green-400">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-red-400">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Leave Request Form */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-teal-400" />
              Request Leave
            </h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              icon={<Plus className="w-4 h-4" />}
              className="shadow-lg hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {showForm ? 'Hide Form' : 'New Request'}
            </Button>
          </div>

          {showForm && (
            <Card className="bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-slate-700/50">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                      Leave Type *
                    </label>
                    <UnifiedDropdown
                      value={formData.type}
                      onChange={handleLeaveTypeChange}
                      options={[
                        { value: '', label: 'Select leave type' },
                        { value: 'Annual Leave', label: 'Annual Leave' },
                        { value: 'Sick Leave', label: 'Sick Leave' },
                        { value: 'Personal Leave', label: 'Personal Leave' },
                        { value: 'Maternity Leave', label: 'Maternity Leave' },
                        { value: 'Paternity Leave', label: 'Paternity Leave' }
                      ]}
                      placeholder="Select leave type"
                      required={true}
                    />
                    {formData.type && (
                      <div className="mt-2 text-xs">
                        {(() => {
                          const balance = leaveBalance.find(b => b.type === formData.type);
                          if (balance) {
                            return (
                              <p className={balance.remaining <= 0 ? 'text-red-400' : balance.remaining <= 2 ? 'text-yellow-400' : 'text-green-400'}>
                                Available: {balance.remaining} days
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
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
                      min={new Date().toISOString().split('T')[0]}
                      icon={<Calendar className="w-4 h-4" />}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className={`block text-sm font-medium mb-2 ${!formData.startDate ? 'text-gray-500' : 'text-gray-300'}`}>
                      End Date *
                    </label>
                    <Input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      disabled={!formData.startDate}
                      icon={<Calendar className="w-4 h-4" />}
                      required
                    />
                    {!formData.startDate && (
                      <p className="mt-1 text-xs text-gray-500">Select a start date first</p>
                    )}
                    {formDuration > 0 && (
                      <p className="mt-2 text-sm text-teal-400">
                        Duration: {formDuration} day{formDuration > 1 ? 's' : ''}
                      </p>
                    )}
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
              <CalendarX className="w-16 h-16 text-gray-500 mb-4" />
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
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
                          <div className="text-xs text-gray-500">
                            {calculateDuration(leave.startDate, leave.endDate)} days
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {leave.status === 'Pending' && (
                            <Button
                              onClick={() => handleCancelLeave(leave.id)}
                              disabled={actionLoading === leave.id}
                              loading={actionLoading === leave.id}
                              variant="danger"
                              size="sm"
                              icon={<XOctagon className="w-3 h-3" />}
                            >
                              Cancel
                            </Button>
                          )}
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
