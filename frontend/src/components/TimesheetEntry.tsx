import { useState, useEffect } from 'react';
import { 
  getMyTimesheet, 
  getAllTimesheets, 
  createTimesheetEntry, 
  updateTimesheetEntry, 
  approveTimesheetEntry, 
  deleteTimesheetEntry,
  getTimesheetHistory,
  bulkApproveTimesheets,
  type TimesheetEntry as TimesheetEntryType, 
  type CreateTimesheetRequest,
  type ApproveTimesheetRequest
} from '../api/timesheetApi';
import { useAuthStore, useCanApproveTimesheet } from '../store/useAuthStore';
import { useEmployeeStore } from '../store/useEmployeeStore';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import Card from './Card';
import UnifiedDropdown from './UnifiedDropdown';
import { PageTransition } from './PageTransition';
import { StandardLayout } from './StandardLayout';
import { TableSkeleton, CardSkeleton } from './LoadingSkeleton';
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
  Info
} from 'lucide-react';

const TimesheetEntry: React.FC = () => {
  const { user } = useAuthStore();
  const canApproveTimesheet = useCanApproveTimesheet();
  const { employees } = useEmployeeStore();
  
  // Debug authentication state
  // console.log('🔐 Auth state:', { user, token: token ? 'exists' : 'missing', isAuthenticated });
  
  // Initialize activeTab from localStorage, default to 'my-timesheet'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('timesheet-active-tab') || 'my-timesheet';
    }
    return 'my-timesheet';
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timesheet-active-tab', activeTab);
    }
  }, [activeTab]);
  const [timesheets, setTimesheets] = useState<TimesheetEntryType[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntryType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkComments, setBulkComments] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTimesheets, setFilteredTimesheets] = useState<TimesheetEntryType[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateTimesheetRequest>({
    date: '',
    hours: 0,
    description: ''
  });

  // Quick add form state
  const [quickAddData, setQuickAddData] = useState<CreateTimesheetRequest>({
    date: new Date().toISOString().split('T')[0],
    hours: 8,
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

  // Filter timesheets based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTimesheets(timesheets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = timesheets.filter(entry => {
        // Search in date, description, employee name, status
        const dateMatch = new Date(entry.date).toLocaleDateString().toLowerCase().includes(query);
        const descriptionMatch = entry.description?.toLowerCase().includes(query) || false;
        const employeeMatch = entry.employee?.name?.toLowerCase().includes(query) || false;
        const statusMatch = entry.status.toLowerCase().includes(query);
        const hoursMatch = entry.hours.toString().includes(query);
        
        return dateMatch || descriptionMatch || employeeMatch || statusMatch || hoursMatch;
      });
      setFilteredTimesheets(filtered);
    }
  }, [timesheets, searchQuery]);

  const fetchTimesheets = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Different params based on tab
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        limit: 50,
        ...(activeTab === 'approvals' && {
          employeeId: filters.employeeId ? parseInt(filters.employeeId) : undefined,
          status: filters.status || 'Pending'
        }),
        // History tab gets all historical data, My Timesheet gets recent entries
        ...(activeTab === 'history' && {
          // For history, get all entries with extended date range
          startDate: filters.startDate || new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0]
        }),
        ...(activeTab === 'my-timesheet' && {
          // For my timesheet, get recent entries (last 3 months)
          startDate: filters.startDate || new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]
        })
      };

      let response;
      if (activeTab === 'my-timesheet' || activeTab === 'history') {
        response = await getMyTimesheet(params);
      } else {
        response = await getAllTimesheets(params);
      }
      
      const timesheetsData = Array.isArray(response) ? response : (response.data || []);
      setTimesheets(timesheetsData);
      setFilteredTimesheets(timesheetsData);
      setPagination(response.pagination || null);
      setCurrentPage(page);
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
        const response = await updateTimesheetEntry(editingEntry.id, {
          hours: formData.hours,
          description: formData.description
        });
        setSuccess(response.message || 'Timesheet entry updated successfully');
      } else {
        // console.log('➕ Creating new timesheet entry');
        // console.log('📤 About to call createTimesheetEntry with:', formData);
        const response = await createTimesheetEntry(formData);
        // console.log('✅ createTimesheetEntry completed');
        setSuccess(response.message || 'Timesheet entry created successfully');
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

  const handleEdit = (entry: TimesheetEntryType) => {
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

  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      const params = {
        startDate: activeTab === 'history' ? (filters.startDate || new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString().split('T')[0]) : filters.startDate,
        endDate: filters.endDate,
        format: format
      };
      
      if (format === 'pdf') {
        // For PDF export, we'll create a simple PDF-like text format for now
        const csvData = await getTimesheetHistory({ ...params, format: 'csv' });
        if (csvData.success) {
          const pdfContent = generatePDFContent(csvData.data);
          const blob = new Blob([pdfContent], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `timesheet-history-${new Date().toISOString().split('T')[0]}.txt`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setSuccess('Timesheet history exported successfully');
        }
      } else {
        const response = await getTimesheetHistory(params);
        
        if (response.success) {
          // Create download link
          const blob = new Blob([response.data], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `timesheet-history-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setSuccess('Timesheet history exported successfully');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export timesheet history');
    }
  };

  const generatePDFContent = (csvData: string) => {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    let content = 'TIMESHEET HISTORY REPORT\n';
    content += 'Generated: ' + new Date().toLocaleDateString() + '\n';
    content += '=====================================\n\n';
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        content += `Entry ${i + 1}:\n`;
        headers.forEach((header, index) => {
          if (values[index]) {
            content += `  ${header.trim()}: ${values[index].trim()}\n`;
          }
        });
        content += '\n';
      }
    }
    
    return content;
  };

  const handleBulkApprove = async (status: 'Approved' | 'Rejected') => {
    if (selectedEntries.length === 0) {
      setError('Please select at least one timesheet entry');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await bulkApproveTimesheets({
        timesheetIds: selectedEntries,
        status,
        comments: bulkComments
      });
      
      setSuccess(response.message || `Successfully ${status.toLowerCase()} ${selectedEntries.length} entries`);
      setSelectedEntries([]);
      setShowBulkActions(false);
      setBulkComments('');
      fetchTimesheets(currentPage);
    } catch (err: any) {
      setError(err.message || `Failed to bulk ${status.toLowerCase()} entries`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntry = (entryId: number) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSelectAll = () => {
    const pendingEntries = timesheets.filter(entry => entry.status === 'Pending');
    const allSelected = pendingEntries.every(entry => selectedEntries.includes(entry.id));
    
    if (allSelected) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(pendingEntries.map(entry => entry.id));
    }
  };

  const handleQuickAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await createTimesheetEntry(quickAddData);
      setSuccess(response.message || 'Timesheet entry created successfully');
      
      // Reset quick add form
      setQuickAddData({
        date: new Date().toISOString().split('T')[0],
        hours: 8,
        description: ''
      });
      setShowQuickAdd(false);
      
      // Refresh data
      fetchTimesheets(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to create timesheet entry');
    } finally {
      setLoading(false);
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
            
            {(canApproveTimesheet || activeTab === 'approvals') && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'approvals'
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Approvals
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

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {activeTab === 'my-timesheet' && (
              <Button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                icon={<Plus className="w-4 h-4" />}
              >
                {showQuickAdd ? 'Cancel' : 'Add Timesheet'}
              </Button>
            )}
            
            {activeTab === 'approvals' && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Filter:</label>
                <UnifiedDropdown
                  value={filters.employeeId || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, employeeId: value as string }))}
                  options={[
                    { value: '', label: 'All Employees' },
                    ...employees.map(emp => ({ value: emp.id, label: emp.name }))
                  ]}
                  size="sm"
                  showLabel={false}
                  className="w-48"
                />
                <UnifiedDropdown
                  value={filters.status || ''}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value as string }))}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' }
                  ]}
                  size="sm"
                  showLabel={false}
                  className="w-32"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExport}
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
              size="sm"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Quick Add Form */}
        {showQuickAdd && activeTab === 'my-timesheet' && (
          <>
            <Card className="mb-6 bg-blue-600/10 border-blue-600/30">
              <div className="p-4">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 mr-2 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">My Timesheet</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Manage your recent timesheet entries from the last 3 months. Add new entries, edit pending submissions, and track your current work hours.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Showing entries from:</span>
                  <span className="text-blue-300 font-medium">
                    {new Date(new Date().setMonth(new Date().getMonth() - 3)).toLocaleDateString()} - Present
                  </span>
                </div>
              </div>
            </Card>

            <Card className="mb-6 bg-teal-600/10 border-teal-600/30">
              <div className="p-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Timesheet Entry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                    <Input
                      type="date"
                      value={quickAddData.date}
                      onChange={(e) => setQuickAddData({ ...quickAddData, date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Hours</label>
                    <Input
                      type="number"
                      value={quickAddData.hours || ''}
                      onChange={(e) => setQuickAddData({ ...quickAddData, hours: parseFloat(e.target.value) || 0 })}
                      min="0.5"
                      max="24"
                      step="0.5"
                      placeholder="8"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Description (optional)</label>
                    <Input
                      type="text"
                      value={quickAddData.description}
                      onChange={(e) => setQuickAddData({ ...quickAddData, description: e.target.value })}
                      placeholder="What did you work on?"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button
                      onClick={handleQuickAdd}
                      loading={loading}
                      icon={<Plus className="w-4 h-4" />}
                      className="flex-1"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setShowQuickAdd(false)}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'history' && (
          <Card className="mb-6 bg-purple-600/10 border-purple-600/30">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                <h3 className="text-lg font-medium text-white">History & Export</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                View your complete timesheet history from the past 12 months. Access detailed analytics and export your data in CSV or PDF format for reporting.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Showing entries from:</span>
                <span className="text-purple-300 font-medium">
                  {new Date(new Date().setMonth(new Date().getMonth() - 12)).toLocaleDateString()} - Present
                </span>
              </div>
            </div>
          </Card>
        )}

        
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
                    max={new Date().toISOString().split('T')[0]}
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

        {/* Bulk Actions Bar */}
        {activeTab === 'approvals' && selectedEntries.length > 0 && (
          <Card className="mb-4 bg-teal-600/10 border-teal-600/30">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-teal-300">
                  {selectedEntries.length} entry{selectedEntries.length > 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  variant="secondary"
                  size="sm"
                >
                  {showBulkActions ? 'Hide Actions' : 'Show Actions'}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setSelectedEntries([])}
                  variant="secondary"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
            
            {showBulkActions && (
              <div className="border-t border-teal-600/30 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Comments (optional)
                  </label>
                  <textarea
                    value={bulkComments}
                    onChange={(e) => setBulkComments(e.target.value)}
                    placeholder="Add comments for bulk approval/rejection..."
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                  />
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleBulkApprove('Approved')}
                    loading={loading}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    Approve Selected ({selectedEntries.length})
                  </Button>
                  <Button
                    onClick={() => handleBulkApprove('Rejected')}
                    variant="danger"
                    loading={loading}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Reject Selected ({selectedEntries.length})
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Search Bar */}
        <Card className="mb-4">
          <div className="p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search timesheets by date, description, employee, status, or hours..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-700/60 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-400">
                Found {filteredTimesheets.length} result{filteredTimesheets.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
            )}
          </div>
        </Card>

        {activeTab === 'history' && (
          /* Analytics Section for History Tab */
          <Card className="mb-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Timesheet Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {filteredTimesheets.reduce((sum, entry) => sum + entry.hours, 0)}h
                  </div>
                  <div className="text-sm text-gray-400">Total Hours</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {filteredTimesheets.filter(entry => entry.status === 'Approved').length}
                  </div>
                  <div className="text-sm text-gray-400">Approved</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {filteredTimesheets.filter(entry => entry.status === 'Pending').length}
                  </div>
                  <div className="text-sm text-gray-400">Pending</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">
                    {filteredTimesheets.filter(entry => entry.status === 'Rejected').length}
                  </div>
                  <div className="text-sm text-gray-400">Rejected</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Timesheet Entries Table */}
        <Card className="overflow-hidden border-slate-700/50">
          <div className="px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-teal-400" />
                {activeTab === 'history' ? 'Historical Entries' : 'Timesheet Entries'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {filteredTimesheets.length} {filteredTimesheets.length === 1 ? 'entry' : 'entries'}
                </div>
                {activeTab === 'history' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExport('csv')}
                      variant="secondary"
                      icon={<Download className="w-4 h-4" />}
                      size="sm"
                    >
                      Export CSV
                    </Button>
                    <Button
                      onClick={() => handleExport('pdf')}
                      variant="secondary"
                      size="sm"
                    >
                      Export PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {loading ? (
            <>
              {/* Desktop Table Skeleton */}
              <div className="hidden lg:block">
                <TableSkeleton rows={5} />
              </div>
              {/* Mobile Card Skeleton */}
              <div className="lg:hidden">
                <CardSkeleton rows={3} />
              </div>
            </>
          ) : filteredTimesheets.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchQuery ? 'No results found' : 'No timesheet entries found'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchQuery 
                  ? `No entries match "${searchQuery}"`
                  : (activeTab === 'my-timesheet' ? 'Add your first timesheet entry to get started.' : 'No entries match the current filters.')
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <div className="min-w-full lg:min-w-0">
                  <table className="min-w-full">
                    <thead className="bg-slate-800/50 border-b border-slate-700/50">
                      <tr>
                      {activeTab === 'approvals' && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={filteredTimesheets.filter(entry => entry.status === 'Pending').every(entry => selectedEntries.includes(entry.id))}
                            className="rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                          />
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      {activeTab !== 'my-timesheet' && (
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                          Employee
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Hours
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredTimesheets.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-700/40 transition-colors">
                        {activeTab === 'approvals' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.status === 'Pending' && (
                              <input
                                type="checkbox"
                                checked={selectedEntries.includes(entry.id)}
                                onChange={() => handleSelectEntry(entry.id)}
                                className="rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                              />
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </td>
                        {activeTab !== 'my-timesheet' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {entry.employee?.name || 'You'}
                          </div>
                          {entry.employee?.department && (
                            <div className="text-xs text-gray-400">
                              {entry.employee.department}
                            </div>
                          )}
                        </td>
                      )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {entry.hours}h
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-md">
                            {entry.description || <span className="text-gray-500 italic">No description</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {activeTab === 'my-timesheet' && entry.status === 'Pending' && (
                              <>
                                <Button
                                  onClick={() => handleEdit(entry)}
                                  size="sm"
                                  variant="secondary"
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
                              <span className="text-xs text-gray-500">
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
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden mt-4 space-y-4">
              {filteredTimesheets.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {activeTab === 'approvals' && entry.status === 'Pending' && (
                        <input
                          type="checkbox"
                          checked={selectedEntries.includes(entry.id)}
                          onChange={() => handleSelectEntry(entry.id)}
                          className="rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        {activeTab !== 'my-timesheet' && entry.employee && (
                          <div className="text-xs text-gray-400">
                            {entry.employee.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Hours</span>
                      <span className="text-sm font-medium text-white">{entry.hours}h</span>
                    </div>
                    
                    {entry.description && (
                      <div className="flex items-start justify-between">
                        <span className="text-xs text-gray-400">Description</span>
                        <span className="text-sm text-gray-300 text-right max-w-[60%]">
                          {entry.description}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-700/50">
                      {activeTab === 'my-timesheet' && entry.status === 'Pending' && (
                        <>
                          <Button
                            onClick={() => handleEdit(entry)}
                            size="sm"
                            variant="secondary"
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
                        <span className="text-xs text-gray-500">
                          {entry.status}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            </>
          )}
        </Card>

        {/* Pagination Controls */}
        {pagination && pagination.pages > 1 && (
          <Card className="mt-4">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => fetchTimesheets(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  variant="secondary"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => fetchTimesheets(pageNum)}
                        variant={pageNum === pagination.page ? "primary" : "secondary"}
                        size="sm"
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => fetchTimesheets(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                  variant="secondary"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
      </StandardLayout>
    </PageTransition>
  );
};

export default TimesheetEntry;
