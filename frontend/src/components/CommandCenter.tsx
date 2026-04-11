import React from 'react';
import { StandardLayout } from './StandardLayout';
import { Zap, Activity, Users, AlertTriangle, Shield } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';

const CommandCenter: React.FC = () => {
  const stats = [
    {
      title: 'System Alerts',
      value: '3',
      change: '-2',
      icon: AlertTriangle,
      color: 'text-red-400'
    },
    {
      title: 'Pending Workflows',
      value: '12',
      change: '+4',
      icon: Zap,
      color: 'text-yellow-400'
    },
    {
      title: 'Active Integrations',
      value: '8',
      change: 'Stable',
      icon: Shield,
      color: 'text-green-400'
    },
    {
      title: 'API Calls Today',
      value: '1,247',
      change: '+18%',
      icon: Activity,
      color: 'text-blue-400'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'alert',
      title: 'API Rate Limit Warning',
      description: 'Approaching daily API limit - 85% used',
      time: '15 minutes ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'workflow',
      title: 'Automated Payroll Workflow',
      description: 'Monthly payroll processing completed successfully',
      time: '2 hours ago',
      priority: 'low'
    },
    {
      id: 3,
      type: 'integration',
      title: 'Slack Integration Sync',
      description: 'Failed to sync with Slack - retry scheduled',
      time: '4 hours ago',
      priority: 'medium'
    }
  ];

  const quickActions = [
    {
      title: 'System Diagnostics',
      description: 'Run system health checks and diagnostics',
      icon: Shield,
      color: 'bg-blue-500/20 text-blue-400'
    },
    {
      title: 'Workflow Monitor',
      description: 'View and manage active workflows',
      icon: Zap,
      color: 'bg-green-500/20 text-green-400'
    },
    {
      title: 'API Dashboard',
      description: 'Monitor API usage and performance',
      icon: Activity,
      color: 'bg-purple-500/20 text-purple-400'
    },
    {
      title: 'Integration Manager',
      description: 'Configure third-party integrations',
      icon: Users,
      color: 'bg-yellow-500/20 text-yellow-400'
    }
  ];

  return (
    <PageTransition>
      <StandardLayout 
        title="Command Center"
        description="Central hub for HR operations and management"
      >
        <FadeIn delay={100}>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Recent Activities
                </h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.priority === 'high' ? 'bg-red-500/20' : 
                        activity.priority === 'low' ? 'bg-green-500/20' :
                        'bg-yellow-500/20'
                      }`}>
                        {activity.type === 'approval' && <Shield className="w-5 h-5 text-yellow-400" />}
                        {activity.type === 'alert' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                        {activity.type === 'task' && <Zap className="w-5 h-5 text-blue-400" />}
                        {activity.type === 'workflow' && <Zap className="w-5 h-5 text-green-400" />}
                        {activity.type === 'integration' && <Users className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{activity.title}</h4>
                        <p className="text-gray-400 text-sm">{activity.description}</p>
                        <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="w-full p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{action.title}</p>
                          <p className="text-gray-400 text-xs">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default CommandCenter;