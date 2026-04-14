import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  getMyTimesheet, 
  getAllTimesheets, 
  createTimesheetEntry, 
  updateTimesheetEntry, 
  approveTimesheetEntry, 
  deleteTimesheetEntry,
  getTimesheetHistory,
  type TimesheetEntry as TimesheetEntryType, 
  type CreateTimesheetRequest,
  type ApproveTimesheetRequest
} from '../api/timesheetApi';
import { useIsAdmin, useAuthStore } from '../store/useAuthStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useNotificationStore } from '../store/notificationStore';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import { StandardLayout } from './StandardLayout';
import { 
  Clock, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  Filter as FilterIcon,
  TrendingUp,
  Users
} from 'lucide-react';

const TimesheetEntry: React.FC = () => {
  const isAdmin = useIsAdmin();
  const { user, token, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const { employees } = useEmployeeStore();
  
  // Debug authentication state
  // console.log('🔐 Auth state:', { user, token: token ? 'exists' : 'missing', isAuthenticated });
  const [activeTab, setActiveTab] = useState('my-timesheet');
  const [timesheets, setTimesheets] = useState<TimesheetEntryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntryType | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState<CreateTimesheetRequest>({
    date: '',
    hours: 0,
    description: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    status: ''
  });

  // Fetch timesheets on component mount and when filters change
  useEffect(() => {
    fetchTimesheets();
  }, [activeTab, filters]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        ...(activeTab === 'approvals' && {
          employeeId: filters.employeeId ? parseInt(filters.employeeId) : undefined,
          status: filters.status || 'Pending'
        })
      };

      let response;
      if (activeTab === 'my-timesheet' || activeTab === 'history') {
        response = await getMyTimesheet(params);
      } else {
        response = await getAllTimesheets(params);
      }
      
      const timesheetsData = response || [];
      setTimesheets(timesheetsData);
    } catch (err: any) {
    console.error('❌ Fetch timesheets error:', err);
      setError(err.message || 'Failed to fetch timesheet entries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // console.log('🔍 Form submission started');
    // console.log('📊 Form data:', formData);
    // console.log('👤 User:', user);
    
    // Validate form data
    if (!formData.date) {
      // console.error('❌ Date is required');
      setError('Date is required');
      return;
    }
    if (!formData.hours || formData.hours <= 0) {
      // console.error('❌ Hours must be greater than 0');
      setError('Hours must be greater than 0');
      return;
    }
    if (!user) {
      // console.error('❌ User not authenticated');
      setError('User not authenticated');
      return;
    }
    
    // console.log('✅ Form validation passed');
    
    try {
      setLoading(true);
      setError(null);

      if (editingEntry) {
        // console.log('✏️ Updating existing entry:', editingEntry.id);
        await updateTimesheetEntry(editingEntry.id, {
          hours: formData.hours,
          description: formData.description
        });
        setSuccess('Timesheet entry updated successfully');
      } else {
        // console.log('➕ Creating new timesheet entry');
        // console.log('📤 About to call createTimesheetEntry with:', formData);
        await createTimesheetEntry(formData);
        // console.log('✅ createTimesheetEntry completed');
        setSuccess('Timesheet entry created successfully');
      }

      setShowForm(false);
      setEditingEntry(null);
      setFormData({ date: '', hours: 0, description: '' });
      fetchTimesheets();
    } catch (err: any) {
      // console.error('❌ Form submission error:', err);
      setError(err.message || 'Failed to save timesheet entry');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: TimesheetEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date.split('T')[0],
      hours: entry.hours,
      description: entry.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this timesheet entry?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteTimesheetEntry(id);
      setSuccess('Timesheet entry deleted successfully');
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || 'Failed to delete timesheet entry');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, status: 'Approved' | 'Rejected', comments?: string) => {
    try {
      setLoading(true);
      const approvalData: ApproveTimesheetRequest = { status, comments };
      await approveTimesheetEntry(id, approvalData);
      setSuccess(`Timesheet entry ${status.toLowerCase()} successfully`);
      fetchTimesheets();
    } catch (err: any) {
      setError(err.message || `Failed to ${status.toLowerCase()} timesheet entry`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        employeeId: filters.employeeId ? parseInt(filters.employeeId) : undefined,
        format: 'csv' as const
      };

      const response = await getTimesheetHistory(params);
      
      // Create download link for CSV
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timesheet-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess('Timesheet data exported successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to export timesheet data');
    }
  };

  const resetForm = () => {
    setEditingEntry(null);
    setFormData({ date: '', hours: 0, description: '' });
    setShowForm(false);
  };

  // Calculate weekly statistics
  const weekStats = {
    totalHours: timesheets.reduce((sum, entry) => sum + entry.hours, 0),
    pendingCount: timesheets.filter(entry => entry.status === 'Pending').length,
    approvedCount: timesheets.filter(entry => entry.status === 'Approved').length,
    rejectedCount: timesheets.filter(entry => entry.status === 'Rejected').length
  };

  return (
    <PageTransition>
      <StandardLayout 
        title="Timesheet Management"
        description="Manage your timesheet entries and track work hours"
      >
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-white">{weekStats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{weekStats.pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-400">{weekStats.approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{weekStats.rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-timesheet')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-timesheet'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              My Timesheet
            </button>
            
            {(isAdmin || activeTab === 'approvals') && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approvals'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Pending Approvals
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-teal-500 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              History & Export
            </button>
          </nav>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            
            {activeTab === 'approvals' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Employee</label>
                  <select
                    value={filters.employeeId}
                    onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="">All Status</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="flex gap-2 ml-auto">
              {activeTab === 'history' && (
                <Button
                  onClick={handleExport}
                  icon={<Download className="w-4 h-4" />}
                  variant="secondary"
                >
                  Export CSV
                </Button>
              )}
              
              {activeTab === 'my-timesheet' && (
                <Button
                  onClick={() => setShowForm(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Entry
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Timesheet Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingEntry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    disabled={!!editingEntry}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hours *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                    placeholder="Number of hours worked"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of work done"
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    {editingEntry ? 'Update' : 'Create'} Entry
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Timesheet Entries Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              <span className="ml-3 text-gray-400">Loading timesheet entries...</span>
            </div>
          ) : timesheets.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No timesheet entries found</p>
              <p className="text-gray-500 text-sm mt-2">
                {activeTab === 'my-timesheet' ? 'Add your first timesheet entry to get started.' : 'No entries match the current filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Description
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
                  {timesheets.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {entry.employee?.name || 'You'}
                        </div>
                        {entry.employee?.department && (
                          <div className="text-xs text-gray-400">
                            {entry.employee.department}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">
                          {entry.hours}h
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs">
                          {entry.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {activeTab === 'my-timesheet' && entry.status === 'Pending' && (
                            <>
                              <Button
                                onClick={() => handleEdit(entry)}
                                size="sm"
                                icon={<Edit className="w-3 h-3" />}
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDelete(entry.id)}
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-3 h-3" />}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          
                          {activeTab === 'approvals' && entry.status === 'Pending' && (
                            <>
                              <Button
                                onClick={() => handleApprove(entry.id, 'Approved')}
                                size="sm"
                                icon={<CheckCircle className="w-3 h-3" />}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleApprove(entry.id, 'Rejected')}
                                variant="danger"
                                size="sm"
                                icon={<XCircle className="w-3 h-3" />}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {entry.status !== 'Pending' && (
                            <span className="text-sm text-gray-500">
                              {entry.status}
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
        </Card>
      </StandardLayout>
    </PageTransition>
  );
};

export default TimesheetEntry;
