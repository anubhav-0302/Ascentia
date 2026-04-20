import React, { useState, useEffect, useMemo } from 'react';
import { StandardLayout } from './StandardLayout';
import { DollarSign, Calendar, Download, Users, Shield, FileText, Calculator, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import Card from './Card';
import UnifiedDropdown from './UnifiedDropdown';
import { PageTransition, FadeIn } from './PageTransition';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import { useIsAdmin, useAuthStore } from '../store/useAuthStore';
import { 
  getSalaryComponents, 
  createSalaryComponent, 
  updateSalaryComponent, 
  deleteSalaryComponent,
  getEmployeeSalaries,
  assignSalaryToEmployee,
  type SalaryComponent,
  type CreateSalaryComponentRequest,
  type AssignSalaryRequest
} from '../api/payrollApi';
import { useEmployeeStore } from '../store/useEmployeeStore';
import { useModalWithUnsavedChanges } from '../hooks/useModalWithUnsavedChanges';
import { getPayrollAccessibleEmployees } from '../utils/rbacFilters';

const PayrollBenefits: React.FC = () => {
  // Initialize activeTab from localStorage, default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payroll-active-tab') || 'overview';
    }
    return 'overview';
  });
  const [selectedPayPeriod, setSelectedPayPeriod] = useState('current');
  const isAdmin = useIsAdmin();
  const { user } = useAuthStore();
  const { employees: storeEmployees, fetchEmployees } = useEmployeeStore();
  const [employees, setEmployees] = useState(storeEmployees || []);

  // RBAC: Determine access level
  const canManagePayroll = isAdmin || user?.role === 'hr' || user?.role === 'admin';
  const canViewTeamPayroll = user?.role === 'teamlead' || user?.role === 'manager';
  const canViewOwnPayroll = user?.role === 'employee';

  // Filter employees based on role
  const accessibleEmployees = getPayrollAccessibleEmployees(employees, user);
  
  // Salary components state
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [employeeSalaries, setEmployeeSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter employee salaries based on role
  const filteredEmployeeSalaries = useMemo(() => {
    return employeeSalaries.filter(salary => {
      if (canManagePayroll) return true; // Admin/HR can see all
      if (canViewTeamPayroll) {
        // Managers can see team members' salaries
        const employee = employees.find(emp => emp.id === salary.employeeId);
        return employee?.department === user?.department;
      }
      if (canViewOwnPayroll) {
        // Employees can only see their own salary
        return salary.employeeId === user?.id;
      }
      return false;
    });
  }, [employeeSalaries, canManagePayroll, canViewTeamPayroll, canViewOwnPayroll, employees, user]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  
  // Form states
  const [componentForm, setComponentForm] = useState<CreateSalaryComponentRequest>({
    name: '',
    type: 'Earning',
    category: 'Basic',
    amount: 0,
    isPercentage: false,
    isTaxable: true
  });
  
  const [assignForm, setAssignForm] = useState<AssignSalaryRequest>({
    employeeId: null as any,
    componentId: null as any,
    amount: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('payroll-active-tab', activeTab);
    }
  }, [activeTab]);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Sync store employees with local state
  useEffect(() => {
    if (storeEmployees && storeEmployees.length > 0) {
      setEmployees(storeEmployees);
      console.log('👥 Employees synced from store:', storeEmployees.length);
    }
  }, [storeEmployees]);

  // Fetch salary components on component mount and when tabs change
  useEffect(() => {
    fetchSalaryComponents();
    if (activeTab === 'salary-components') {
      fetchEmployeeSalaries();
    }
  }, [activeTab]);

  // Fetch components and ensure employees are loaded when assign modal opens
  useEffect(() => {
    if (showAssignModal) {
      fetchSalaryComponents();
      console.log('📋 Employees available:', employees.length);
      if (employees.length === 0) {
        console.warn('⚠️ No employees loaded - they should be available from useEmployeeStore');
      }
    }
  }, [showAssignModal, employees]);

  // Detect unsaved changes in component form
  const isComponentFormChanged = () => {
    if (editingComponent) {
      return (
        componentForm.name !== editingComponent.name ||
        componentForm.type !== editingComponent.type ||
        componentForm.category !== editingComponent.category ||
        componentForm.amount !== editingComponent.amount ||
        componentForm.isPercentage !== editingComponent.isPercentage ||
        componentForm.isTaxable !== editingComponent.isTaxable
      );
    }
    // For new component, check if any field has been filled
    return (
      componentForm.name.trim() !== '' ||
      componentForm.amount !== 0
    );
  };

  // Detect unsaved changes in assign form
  const isAssignFormChanged = () => {
    return (
      assignForm.employeeId !== null ||
      assignForm.componentId !== null ||
      assignForm.amount !== 0 ||
      assignForm.effectiveDate.trim() !== ''
    );
  };

  // Modal close handlers with unsaved changes warning
  const { handleClose: handleCloseComponentModal } = useModalWithUnsavedChanges({
    isOpen: showComponentModal,
    onClose: () => {
      setShowComponentModal(false);
      setEditingComponent(null);
      setComponentForm({
        name: '',
        type: 'Earning',
        category: 'Basic',
        amount: 0,
        isPercentage: false,
        isTaxable: true
      });
    },
    hasUnsavedChanges: isComponentFormChanged()
  });

  const { handleClose: handleCloseAssignModal } = useModalWithUnsavedChanges({
    isOpen: showAssignModal,
    onClose: () => {
      setShowAssignModal(false);
      setAssignForm({
        employeeId: null as any,
        componentId: null as any,
        amount: 0,
        effectiveDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    },
    hasUnsavedChanges: isAssignFormChanged()
  });

  const fetchSalaryComponents = async () => {
    try {
      setLoading(true);
      const response = await getSalaryComponents();
      setSalaryComponents(Array.isArray(response) ? response : response?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch salary components');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeSalaries = async () => {
    try {
      const response = await getEmployeeSalaries();
      setEmployeeSalaries(Array.isArray(response) ? response : response?.data || []);
    } catch (err: any) {
      console.error('Failed to fetch employee salaries:', err);
    }
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await createSalaryComponent(componentForm);
      setSuccess('Salary component created successfully');
      setShowComponentModal(false);
      setComponentForm({
        name: '',
        type: 'Earning',
        category: 'Basic',
        amount: 0,
        isPercentage: false,
        isTaxable: true
      });
      
      // Close modal first, then switch tab and fetch
      setTimeout(() => {
        setActiveTab('salary-components');
        // Fetch directly without relying on useEffect
        (async () => {
          try {
            const response = await getSalaryComponents();
            // getSalaryComponents returns the array directly (response.data from API)
            const componentsArray = response;
            setSalaryComponents(componentsArray);
            console.log('✅ Components loaded after creation:', componentsArray.length);
          } catch (err: any) {
            console.error('Failed to fetch components:', err);
          }
        })();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to create salary component');
      console.error('Create component error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingComponent) return;
    
    try {
      setLoading(true);
      await updateSalaryComponent(editingComponent.id, componentForm);
      setSuccess('Salary component updated successfully');
      setShowComponentModal(false);
      setEditingComponent(null);
      setComponentForm({
        name: '',
        type: 'Earning',
        category: 'Basic',
        amount: 0,
        isPercentage: false,
        isTaxable: true
      });
      fetchSalaryComponents();
    } catch (err: any) {
      setError(err.message || 'Failed to update salary component');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComponent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this salary component?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteSalaryComponent(id);
      setSuccess('Salary component deleted successfully');
      fetchSalaryComponents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete salary component');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await assignSalaryToEmployee(assignForm);
      setSuccess('Salary component assigned successfully');
      setShowAssignModal(false);
      setAssignForm({
        employeeId: null as any,
        componentId: null as any,
        amount: 0,
        effectiveDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      fetchEmployeeSalaries();
      console.log('Assign Salary Success');
    } catch (err: any) {
      setError(err.message || 'Failed to assign salary component');
      console.error('Assign Salary Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComponent = (component: SalaryComponent) => {
    setEditingComponent(component);
    setComponentForm({
      name: component.name,
      type: component.type,
      category: component.category,
      amount: component.amount,
      isPercentage: component.isPercentage,
      isTaxable: component.isTaxable
    });
    setShowComponentModal(true);
  };

  const payrollStats = [
    {
      title: 'Total Payroll',
      value: '$0',
      change: 'No data',
      icon: DollarSign,
      color: 'text-gray-400'
    },
    {
      title: 'Active Employees',
      value: '0',
      change: 'No data',
      icon: Users,
      color: 'text-gray-400'
    },
    {
      title: 'Benefits Cost',
      value: '$0',
      change: 'No data',
      icon: Shield,
      color: 'text-gray-400'
    },
    {
      title: 'Tax Withheld',
      value: '$0',
      change: 'No data',
      icon: Calculator,
      color: 'text-gray-400'
    }
  ];

  const recentPayrolls: any[] = [];

  const benefitsEnrollment = [
    {
      id: 1,
      name: 'Health Insurance',
      enrolled: 0,
      eligible: 0,
      percentage: 0,
      cost: '$0'
    },
    {
      id: 2,
      name: 'Dental Insurance',
      enrolled: 0,
      eligible: 0,
      percentage: 0,
      cost: '$0'
    },
    {
      id: 3,
      name: '401(k) Retirement',
      enrolled: 0,
      eligible: 0,
      percentage: 0,
      cost: '$0'
    }
  ];

  const handleExportPayroll = () => {
    const payrollData = {
      period: selectedPayPeriod,
      totalPayroll: '$0',
      employees: 0,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(payrollData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcessPayroll = () => {
    if (confirm('Are you ready to process payroll for the current period? This action cannot be undone.')) {
      alert('Payroll processing initiated. You will receive a notification when processing is complete.');
    }
  };

  const handleRunPayroll = () => {
    alert('Payroll calculator opened. This would show detailed salary calculations, deductions, and net pay breakdowns.');
  };

  const handleManageBenefits = () => {
    alert('Benefits management portal opened. This would allow enrollment changes, plan comparisons, and beneficiary updates.');
  };

  return (
    <PageTransition>
      <StandardLayout 
        title="Payroll & Benefits"
        description="Manage payroll processing, benefits enrollment, and compensation"
      >
        <FadeIn delay={100}>
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
                <CheckCircle className="w-5 h-5 text-red-400 mr-3" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-xl p-1 mb-6">
            <nav className="flex space-x-1 overflow-x-auto scrollbar-hide lg:overflow-visible">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 min-w-fit ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 min-w-fit ${
                  activeTab === 'payroll'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calculator className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Payroll Processing</span>
                <span className="sm:hidden">Payroll</span>
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 min-w-fit ${
                  activeTab === 'benefits'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Benefits Management</span>
                <span className="sm:hidden">Benefits</span>
              </button>
              <button
                onClick={() => setActiveTab('salary-components')}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 min-w-fit ${
                  activeTab === 'salary-components'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Salary Components</span>
                <span className="sm:hidden">Salary</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 min-w-fit ${
                  activeTab === 'reports'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Download className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Reports & Analytics</span>
                <span className="sm:hidden">Reports</span>
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {payrollStats.map((stat, index) => (
                  <div key={index} className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-4 lg:p-6 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`bg-blue-500/20 p-3 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300`}>
                        <stat.icon className={`w-6 h-6 text-blue-400`} />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{stat.change}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:text-blue-100 transition-colors duration-300">{stat.value}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{stat.title}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-4 lg:p-6 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-500/20 p-3 rounded-xl group-hover:bg-green-500/30 transition-colors duration-300">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-white group-hover:text-green-100 transition-colors duration-300">Process Payroll</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-300">Run payroll for current pay period</p>
                  <button 
                    onClick={handleProcessPayroll}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Process Now
                  </button>
                </div>

                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-4 lg:p-6 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl group-hover:bg-blue-500/30 transition-colors duration-300">
                      <Calculator className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-white group-hover:text-blue-100 transition-colors duration-300">Payroll Calculator</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-300">Calculate salaries and deductions</p>
                  <button 
                    onClick={handleRunPayroll}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Open Calculator
                  </button>
                </div>

                <div className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-4 lg:p-6 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-purple-500/20 p-3 rounded-xl group-hover:bg-purple-500/30 transition-colors duration-300">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-base lg:text-lg font-semibold text-white group-hover:text-purple-100 transition-colors duration-300">Benefits Portal</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4 group-hover:text-gray-300 transition-colors duration-300">Manage employee benefits enrollment</p>
                  <button 
                    onClick={handleManageBenefits}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg font-medium shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    Manage Benefits
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payroll Processing Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-400" />
                    Recent Payrolls
                  </h3>
                  <div className="flex space-x-2">
                    <UnifiedDropdown
                      value={selectedPayPeriod}
                      onChange={(value) => setSelectedPayPeriod(value as string)}
                      options={[
                        { value: 'current', label: 'Current Period' },
                        { value: 'previous', label: 'Previous Period' },
                        { value: 'ytd', label: 'Year to Date' }
                      ]}
                      size="sm"
                      showLabel={false}
                      className="w-48"
                    />
                    <button 
                      onClick={handleExportPayroll}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentPayrolls.map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{payroll.period}</h4>
                        <p className="text-gray-400 text-sm">Processed: {payroll.processedDate} • {payroll.employees} employees</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-green-400">{payroll.totalAmount}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-400/10 text-green-400">
                          {payroll.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Benefits Management Tab */}
          {activeTab === 'benefits' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-purple-400" />
                  Benefits Enrollment
                </h3>
                <div className="space-y-4">
                  {benefitsEnrollment.map((benefit) => (
                    <div key={benefit.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{benefit.name}</h4>
                          <span className="text-sm text-gray-400">{benefit.cost}/month</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{benefit.enrolled} of {benefit.eligible} enrolled</span>
                          <span>•</span>
                          <span>{benefit.percentage}% participation</span>
                        </div>
                        <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-purple-400 h-2 rounded-full" 
                            style={{ width: `${benefit.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Salary Components Tab */}
          {activeTab === 'salary-components' && (
            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex gap-4">
                {canManagePayroll && (
                  <Button
                    onClick={() => setShowComponentModal(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Component
                  </Button>
                )}
                {canManagePayroll && (
                  <Button
                    onClick={() => setShowAssignModal(true)}
                    icon={<Plus className="w-4 h-4" />}
                    variant="secondary"
                  >
                    Assign to Employee
                  </Button>
                )}
              </div>

              {/* Salary Components Table */}
              <Card className="overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                    <span className="ml-3 text-gray-400">Loading salary components...</span>
                  </div>
                ) : salaryComponents.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No salary components found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Create your first salary component to get started with payroll configuration.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Component Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Taxable
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
                        {salaryComponents.map((component) => (
                          <tr key={component.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-white">
                                {component.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded ${
                                component.type === 'Earning' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {component.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {component.category}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white font-medium">
                                {component.isPercentage ? `${component.amount}%` : `$${component.amount}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded ${
                                component.isTaxable 
                                  ? 'bg-blue-500/20 text-blue-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {component.isTaxable ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {canManagePayroll && (
                                  <>
                                    <Button
                                      onClick={() => handleEditComponent(component)}
                                      size="sm"
                                      icon={<Edit className="w-3 h-3" />}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteComponent(component.id)}
                                      variant="danger"
                                      size="sm"
                                      icon={<Trash2 className="w-3 h-3" />}
                                    >
                                      Delete
                                    </Button>
                                  </>
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

              {/* Employee Salaries Table */}
              <Card className="overflow-hidden">
                <h3 className="text-lg font-semibold text-white mb-4 p-6 pb-0">
                  Assigned Employee Salaries
                </h3>
                {employeeSalaries.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No salary assignments found</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Assign salary components to employees to see their salary structure.
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
                            Component
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Effective Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            End Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {filteredEmployeeSalaries.map((salary) => (
                          <tr key={salary.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">
                                {salary.employee?.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {salary.employee?.department}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">
                                {salary.component?.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {salary.component?.type}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white font-medium">
                                {salary.component?.isPercentage ? `${salary.amount}%` : `$${salary.amount}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {new Date(salary.effectiveDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-300">
                                {salary.endDate ? new Date(salary.endDate).toLocaleDateString() : 'Ongoing'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={salary.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-yellow-400" />
                  Payroll Reports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
                    <h4 className="text-white font-medium mb-1">Payroll Summary</h4>
                    <p className="text-gray-400 text-sm">Monthly payroll breakdown and analysis</p>
                  </button>
                  <button className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
                    <h4 className="text-white font-medium mb-1">Tax Reports</h4>
                    <p className="text-gray-400 text-sm">Tax withholding and compliance reports</p>
                  </button>
                  <button className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
                    <h4 className="text-white font-medium mb-1">Benefits Analysis</h4>
                    <p className="text-gray-400 text-sm">Benefits utilization and cost analysis</p>
                  </button>
                  <button className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors">
                    <h4 className="text-white font-medium mb-1">Year-End Reports</h4>
                    <p className="text-gray-400 text-sm">Annual payroll and tax summaries</p>
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Create/Edit Salary Component Modal */}
          {showComponentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingComponent ? 'Edit Salary Component' : 'Create Salary Component'}
                </h3>
                
                <form onSubmit={editingComponent ? handleUpdateComponent : handleCreateComponent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Component Name *
                    </label>
                    <Input
                      type="text"
                      value={componentForm.name}
                      onChange={(e) => setComponentForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Basic Salary, HRA, PF"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <UnifiedDropdown
                        value={componentForm.type}
                        onChange={(value) => setComponentForm(prev => ({ ...prev, type: value as 'Earning' | 'Deduction' }))}
                        options={[
                          { value: 'Earning', label: 'Earning' },
                          { value: 'Deduction', label: 'Deduction' }
                        ]}
                        label="Type"
                        showLabel={false}
                        required={true}
                        size="md"
                      />
                    </div>

                    <div>
                      <UnifiedDropdown
                        value={componentForm.category}
                        onChange={(value) => setComponentForm(prev => ({ ...prev, category: value as string }))}
                        options={[
                          { value: 'Basic', label: 'Basic' },
                          { value: 'Allowance', label: 'Allowance' },
                          { value: 'Deduction', label: 'Deduction' },
                          { value: 'Bonus', label: 'Bonus' },
                          { value: 'Other', label: 'Other' }
                        ]}
                        label="Category"
                        showLabel={false}
                        required={true}
                        size="md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount {componentForm.isPercentage && '(0-100)'} *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={componentForm.isPercentage ? 100 : undefined}
                      value={componentForm.amount === 0 ? '' : componentForm.amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === '0') {
                          setComponentForm(prev => ({ ...prev, amount: 0 }));
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setComponentForm(prev => ({ ...prev, amount: numValue }));
                          }
                        }
                      }}
                      onFocus={(e) => {
                        // Select all text on focus for easy editing
                        e.target.select();
                      }}
                      placeholder={componentForm.isPercentage ? "Enter percentage (0-100)" : "Enter amount"}
                      required
                    />
                    {componentForm.isPercentage && componentForm.amount > 100 && (
                      <p className="text-red-400 text-sm mt-1">Percentage must be between 0 and 100</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPercentage"
                        checked={componentForm.isPercentage}
                        onChange={(e) => setComponentForm(prev => ({ ...prev, isPercentage: e.target.checked }))}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <label htmlFor="isPercentage" className="ml-2 text-sm text-gray-300">
                        Is Percentage
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isTaxable"
                        checked={componentForm.isTaxable}
                        onChange={(e) => setComponentForm(prev => ({ ...prev, isTaxable: e.target.checked }))}
                        className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-600 rounded focus:ring-teal-500"
                      />
                      <label htmlFor="isTaxable" className="ml-2 text-sm text-gray-300">
                        Is Taxable
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={handleCloseComponentModal}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                    >
                      {editingComponent ? 'Update' : 'Create'} Component
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* Assign Salary to Employee Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Assign Salary Component</h3>
                
                <form onSubmit={handleAssignSalary} className="space-y-4">
                  <div>
                    <UnifiedDropdown
                      value={assignForm.employeeId || ''}
                      onChange={(value) => setAssignForm(prev => ({ ...prev, employeeId: parseInt(value as string) }))}
                      options={[
                        { value: '', label: 'Select an employee' },
                        ...accessibleEmployees.map((emp: any) => ({ value: emp.id, label: emp.name }))
                      ]}
                      label="Employee"
                      showLabel={false}
                      required={true}
                      size="md"
                    />
                  </div>

                  <div>
                    <UnifiedDropdown
                      value={assignForm.componentId || ''}
                      onChange={(value) => setAssignForm(prev => ({ ...prev, componentId: parseInt(value as string) }))}
                      options={[
                        { value: '', label: 'Select a component' },
                        ...salaryComponents.map(comp => ({ value: comp.id, label: comp.name }))
                      ]}
                      label="Salary Component"
                      showLabel={false}
                      required={true}
                      size="md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={assignForm.amount === 0 ? '' : assignForm.amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === '0') {
                          setAssignForm(prev => ({ ...prev, amount: 0 }));
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setAssignForm(prev => ({ ...prev, amount: numValue }));
                          }
                        }
                      }}
                      onFocus={(e) => {
                        // Select all text on focus for easy editing
                        e.target.select();
                      }}
                      placeholder="Amount or percentage"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Effective Date *
                      </label>
                      <Input
                        type="date"
                        value={assignForm.effectiveDate}
                        onChange={(e) => setAssignForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={assignForm.endDate}
                        onChange={(e) => setAssignForm(prev => ({ ...prev, endDate: e.target.value }))}
                        min={assignForm.effectiveDate}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={handleCloseAssignModal}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                    >
                      Assign Component
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default PayrollBenefits;