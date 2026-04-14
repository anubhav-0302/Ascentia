import React, { useState, useEffect } from 'react';
import { StandardLayout } from './StandardLayout';
import { DollarSign, Calendar, Download, Users, Shield, FileText, Calculator, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import { useIsAdmin } from '../store/useAuthStore';
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

const PayrollBenefits: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayPeriod, setSelectedPayPeriod] = useState('current');
  const isAdmin = useIsAdmin();
  const { employees } = useEmployeeStore();
  
  // Salary components state
  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([]);
  const [employeeSalaries, setEmployeeSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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
    employeeId: 0,
    componentId: 0,
    amount: 0,
    effectiveDate: '',
    endDate: ''
  });

  // Fetch salary components on component mount
  useEffect(() => {
    if (activeTab === 'salary-components') {
      fetchSalaryComponents();
      fetchEmployeeSalaries();
    }
  }, [activeTab]);

  const fetchSalaryComponents = async () => {
    try {
      setLoading(true);
      const response = await getSalaryComponents();
      setSalaryComponents(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch salary components');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeSalaries = async () => {
    try {
      const response = await getEmployeeSalaries();
      setEmployeeSalaries(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch employee salaries:', err);
    }
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
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
      fetchSalaryComponents();
    } catch (err: any) {
      setError(err.message || 'Failed to create salary component');
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
        employeeId: 0,
        componentId: 0,
        amount: 0,
        effectiveDate: '',
        endDate: ''
      });
      fetchEmployeeSalaries();
    } catch (err: any) {
      setError(err.message || 'Failed to assign salary component');
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

  const recentPayrolls = [];

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
          <div className="border-b border-slate-700 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('payroll')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payroll'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Payroll Processing
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'benefits'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Benefits Management
              </button>
              <button
                onClick={() => setActiveTab('salary-components')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'salary-components'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Salary Components
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reports'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Reports & Analytics
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {payrollStats.map((stat, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      <span className="text-sm text-gray-400">{stat.change}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Process Payroll</h3>
                  </div>
                  <p className="text-gray-400 mb-4">Run payroll for current pay period</p>
                  <button 
                    onClick={handleProcessPayroll}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                  >
                    Process Now
                  </button>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calculator className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Payroll Calculator</h3>
                  </div>
                  <p className="text-gray-400 mb-4">Calculate salaries and deductions</p>
                  <button 
                    onClick={handleRunPayroll}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    Open Calculator
                  </button>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Benefits Portal</h3>
                  </div>
                  <p className="text-gray-400 mb-4">Manage employee benefits enrollment</p>
                  <button 
                    onClick={handleManageBenefits}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                  >
                    Manage Benefits
                  </button>
                </Card>
              </div>
            </div>
          )}

          {/* Payroll Processing Tab */}
          {activeTab === 'payroll' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    Recent Payrolls
                  </h3>
                  <div className="flex space-x-2">
                    <select 
                      value={selectedPayPeriod}
                      onChange={(e) => setSelectedPayPeriod(e.target.value)}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
                    >
                      <option value="current">Current Period</option>
                      <option value="previous">Previous Period</option>
                      <option value="ytd">Year to Date</option>
                    </select>
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
                {isAdmin && (
                  <Button
                    onClick={() => setShowComponentModal(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add Component
                  </Button>
                )}
                <Button
                  onClick={() => setShowAssignModal(true)}
                  icon={<Plus className="w-4 h-4" />}
                  variant="secondary"
                >
                  Assign to Employee
                </Button>
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
                              <StatusBadge status={component.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {isAdmin && (
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
                        {employeeSalaries.map((salary) => (
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type *
                      </label>
                      <select
                        value={componentForm.type}
                        onChange={(e) => setComponentForm(prev => ({ ...prev, type: e.target.value as 'Earning' | 'Deduction' }))}
                        className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="Earning">Earning</option>
                        <option value="Deduction">Deduction</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={componentForm.category}
                        onChange={(e) => setComponentForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="Basic">Basic</option>
                        <option value="Allowance">Allowance</option>
                        <option value="Deduction">Deduction</option>
                        <option value="Bonus">Bonus</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={componentForm.amount}
                      onChange={(e) => setComponentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="Amount or percentage"
                      required
                    />
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
                      onClick={() => {
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
                      }}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Employee *
                    </label>
                    <select
                      value={assignForm.employeeId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, employeeId: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select an employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Salary Component *
                    </label>
                    <select
                      value={assignForm.componentId}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, componentId: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-slate-700/60 rounded-xl border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      <option value="">Select a component</option>
                      {salaryComponents.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={assignForm.amount}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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
                      onClick={() => {
                        setShowAssignModal(false);
                        setAssignForm({
                          employeeId: 0,
                          componentId: 0,
                          amount: 0,
                          effectiveDate: '',
                          endDate: ''
                        });
                      }}
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