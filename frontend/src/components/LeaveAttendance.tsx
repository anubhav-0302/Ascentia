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
import { Calendar, CheckCircle, XCircle, Plus, XOctagon, CalendarX, AlertTriangle, Search, Filter, TrendingUp, Clock } from 'lucide-react';

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
    startDate: '',
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

      if (start < new Date()) {
        setError('Start date must be today or later');
        toast.error('Start date must be today or later');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate leave duration in days
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
    return diffDays;
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
    const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');
    
    // Standard annual leave quotas (can be made configurable)
    const quotas = {
      'Annual Leave': 21,
      'Sick Leave': 10,
      'Personal Leave': 5,
      'Maternity Leave': 90,
      'Paternity Leave': 14
    };
    
    const used = approvedLeaves.reduce((acc, leave) => {
      const duration = calculateDuration(leave.startDate, leave.endDate);
      acc[leave.type] = (acc[leave.type] || 0) + duration;
      return acc;
    }, {} as Record<string, number>);
    
    // Only show up to Paternity Leave
    const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave'];
    
    const balance = leaveTypes.map(type => ({
      type,
      total: quotas[type],
      used: used[type] || 0,
      remaining: quotas[type] - (used[type] || 0)
    }));
    
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
            <h1 className="text-4xl font-bold text-white mb-2">Leave Management</h1>
            <p className="text-gray-400 text-sm">
              Review and manage all employee leave requests.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                </div>
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by employee, type, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-80"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="secondary"
                  icon={<Filter className="w-4 h-4" />}
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
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            {showFilters && (
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
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
          <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-2xl font-semibold text-white">All Leave Requests</h2>
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
                    {filteredLeaves.map((leave) => (
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
                          <div className="text-xs text-gray-500">
                            {calculateDuration(leave.startDate, leave.endDate)} days
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
                                  disabled={actionLoading === leave.id}
                                  loading={actionLoading === leave.id}
                                  size="sm"
                                  icon={<CheckCircle className="w-3 h-3" />}
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

        {/* Unified Calendar with Leave Balance */}
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" /> Leave Calendar & Balance
            </h2>
            <span className="text-xs text-gray-500">Click dates to select</span>
          </div>
          <div className="flex flex-col lg:flex-row">
            {/* Calendar Section */}
            <div className="flex-1 p-3 border-b lg:border-b-0 lg:border-r border-slate-700/30">
              <LeaveCalendar 
                compact={true}
                small={true}
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
            <div className="lg:w-80 p-3">
              <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-3 h-3 text-teal-400" /> Leave Balance
              </h3>
              <div className="space-y-2">
                {leaveBalance.map((balance) => (
                  <div key={balance.type} className="flex items-center gap-2">
                    <span className="text-xs text-white w-24 shrink-0">{balance.type}</span>
                    <div className="flex-1">
                      <div className="w-full bg-slate-700/50 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            (balance.used / balance.total) >= 0.9 ? 'bg-red-500' :
                            (balance.used / balance.total) >= 0.7 ? 'bg-yellow-500' :
                            'bg-teal-500'
                          }`}
                          style={{ width: `${Math.min((balance.used / balance.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs shrink-0">
                      <span className="text-gray-400">{balance.used}/{balance.total}</span>
                      <span className={`font-semibold ${
                        balance.remaining <= 2 ? 'text-red-400' :
                        balance.remaining <= 5 ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>{balance.remaining}d</span>
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
