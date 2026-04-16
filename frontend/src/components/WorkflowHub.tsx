import React, { useState, useEffect } from 'react';
import { StandardLayout } from './StandardLayout';
import { GitBranch, Plus, Play, Pause, Edit, Trash2, Settings, BarChart3, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  actions: number;
  lastRun: string;
  successRate: number;
}

const WorkflowHub: React.FC = () => {
  // Initialize activeTab from localStorage, default to 'workflows'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('workflow-active-tab') || 'workflows';
    }
    return 'workflows';
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workflow-active-tab', activeTab);
    }
  }, [activeTab]);

  const workflows: Workflow[] = [];

  const workflowTemplates = [
    {
      id: '1',
      name: 'Document Approval',
      description: 'Multi-step document approval process',
      category: 'Approval',
      icon: CheckCircle
    },
    {
      id: '2',
      name: 'Employee Offboarding',
      description: 'Automated offboarding checklist',
      category: 'HR Process',
      icon: GitBranch
    },
    {
      id: '3',
      name: 'Benefits Enrollment',
      description: 'Annual benefits enrollment workflow',
      category: 'Benefits',
      icon: Settings
    },
    {
      id: '4',
      name: 'Compliance Check',
      description: 'Regular compliance monitoring',
      category: 'Compliance',
      icon: AlertTriangle
    }
  ];

  const handleCreateWorkflow = () => {
    const workflowName = prompt('Enter workflow name:');
    if (workflowName) {
      alert(`Creating new workflow: ${workflowName}\n\nThis would open the visual workflow builder with drag-and-drop functionality.`);
    }
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    alert(`Editing workflow: ${workflow.name}\n\nThis would open the visual workflow editor.`);
  };

  const handleToggleWorkflow = (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    alert(`Workflow "${workflow.name}" ${newStatus === 'active' ? 'activated' : 'paused'}.`);
  };

  const handleDeleteWorkflow = (workflow: Workflow) => {
    if (confirm(`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`)) {
      alert(`Workflow "${workflow.name}" deleted successfully.`);
    }
  };

  const handleRunWorkflow = (workflow: Workflow) => {
    alert(`Running workflow: ${workflow.name}\n\nThis would execute the workflow and show real-time progress.`);
  };

  const handleViewAnalytics = (workflow: Workflow) => {
    alert(`Analytics for: ${workflow.name}\n\nThis would show detailed performance metrics, execution history, and optimization suggestions.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'draft': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-400';
    if (rate >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <PageTransition>
      <StandardLayout 
        title="Workflow Hub"
        description="Manage and automate your HR workflows efficiently"
      >
        <FadeIn delay={100}>
          {/* Tab Navigation */}
          <div className="border-b border-slate-700 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('workflows')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'workflows'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Workflows
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'templates'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Active Workflows</h3>
                  <p className="text-gray-400 text-sm">Manage and monitor your automated workflows</p>
                </div>
                <button
                  onClick={handleCreateWorkflow}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </button>
              </div>

              {/* Workflow List */}
              <div className="grid gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium">{workflow.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(workflow.status)}`}>
                            {workflow.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{workflow.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                          <span className="flex items-center">
                            <GitBranch className="w-4 h-4 mr-1" />
                            {workflow.trigger}
                          </span>
                          <span className="flex items-center">
                            <Settings className="w-4 h-4 mr-1" />
                            {workflow.actions} actions
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {workflow.lastRun}
                          </span>
                          <span className={`flex items-center ${getSuccessRateColor(workflow.successRate)}`}>
                            <BarChart3 className="w-4 h-4 mr-1" />
                            {workflow.successRate}% success
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRunWorkflow(workflow)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Run Workflow"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditWorkflow(workflow)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit Workflow"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleWorkflow(workflow)}
                          className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleViewAnalytics(workflow)}
                          className="p-2 text-purple-400 hover:text-purple-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete Workflow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Workflow Templates</h3>
                <p className="text-gray-400 text-sm">Start with pre-built workflow templates</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflowTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card key={template.id} className="p-6 hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-teal-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-1">{template.name}</h4>
                          <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                          <span className="text-xs text-gray-500 bg-slate-700 px-2 py-1 rounded">
                            {template.category}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Workflow Analytics</h3>
                <p className="text-gray-400 text-sm">Monitor workflow performance and optimization opportunities</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">342</span>
                  </div>
                  <h4 className="text-white font-medium">Successful Runs</h4>
                  <p className="text-gray-400 text-sm">This month</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">12</span>
                  </div>
                  <h4 className="text-white font-medium">Failed Runs</h4>
                  <p className="text-gray-400 text-sm">This month</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold text-white">2.3s</span>
                  </div>
                  <h4 className="text-white font-medium">Avg. Runtime</h4>
                  <p className="text-gray-400 text-sm">Per workflow</p>
                </Card>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Workflow Settings</h3>
                <p className="text-gray-400 text-sm">Configure global workflow settings and preferences</p>
              </div>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Auto-retry Failed Workflows</h4>
                      <p className="text-gray-400 text-sm">Automatically retry failed workflows up to 3 times</p>
                    </div>
                    <button className="w-12 h-6 bg-teal-600 rounded-full relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-gray-400 text-sm">Send email notifications for workflow failures</p>
                    </div>
                    <button className="w-12 h-6 bg-slate-600 rounded-full relative">
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Debug Mode</h4>
                      <p className="text-gray-400 text-sm">Enable detailed logging for troubleshooting</p>
                    </div>
                    <button className="w-12 h-6 bg-slate-600 rounded-full relative">
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default WorkflowHub;