import React, { useState } from 'react';
import { StandardLayout } from './StandardLayout';
import { DollarSign, Calendar, Download, Users, Shield, FileText, Calculator } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';

const PayrollBenefits: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPayPeriod, setSelectedPayPeriod] = useState('current');

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
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default PayrollBenefits;