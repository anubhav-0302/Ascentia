import { useState } from "react";

interface Task {
  id: number;
  employeeName: string;
  taskType: string;
  duration: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  avatar: string;
  status: 'pending' | 'approved' | 'denied';
}

const Dashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      employeeName: 'Sarah Johnson',
      taskType: 'Review PTO Request',
      duration: '3 days leave',
      timestamp: '2 hours ago',
      priority: 'medium',
      avatar: 'https://picsum.photos/seed/sarah/40/40.jpg',
      status: 'pending'
    },
    {
      id: 2,
      employeeName: 'Michael Chen',
      taskType: 'Approve Expense Report',
      duration: '$1,250.00',
      timestamp: '4 hours ago',
      priority: 'high',
      avatar: 'https://picsum.photos/seed/michael/40/40.jpg',
      status: 'pending'
    },  
    {
      id: 3,
      employeeName: 'Emily Davis',
      taskType: 'Review Time Sheet',
      duration: '40 hours',
      timestamp: '6 hours ago',
      priority: 'low',
      avatar: 'https://picsum.photos/seed/emily/40/40.jpg',
      status: 'pending'
    }
  ]);

  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');

  const handleStatCardClick = (cardName: string) => {       
    console.log(`Clicked ${cardName} card`);
  };

  const handleApprove = (taskId: number) => {
    console.log(`Approved task ${taskId}`);
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'approved' } : task
    ));
    
    // Reset after 3 seconds
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'pending' } : task
      ));
    }, 3000);
  };

  const handleDeny = (taskId: number) => {
    console.log(`Denied task ${taskId}`);
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'denied' } : task
    ));
    
    // Reset after 3 seconds
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'pending' } : task
      ));
    }, 3000);
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    setSelectedAction(action);
    setShowQuickActions(true);
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const renderTaskCard = (task: Task) => {
    const isApproved = task.status === 'approved';
    const isDenied = task.status === 'denied';
    
    return (
      <div 
        key={task.id}
        className={`bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 ${
          isApproved ? 'bg-green-900/20 border-green-700/50' : 
          isDenied ? 'bg-red-900/20 border-red-700/50' : 
          'hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={task.avatar} 
              alt={task.employeeName} 
              className="w-10 h-10 rounded-full border-2 border-slate-600"
            />
            <div>
              <h4 className="text-white font-medium">{task.employeeName}</h4>
              <p className="text-gray-400 text-sm">{task.timestamp}</p>
            </div>
          </div>
          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">{task.taskType}</h3>
          <p className="text-gray-300 text-sm flex items-center">
            <i className="fas fa-clock mr-2 text-gray-500"></i>
            {task.duration}
          </p>
        </div>
        
        {/* Status Message */}
        {isApproved && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm font-medium flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Approved
            </p>
          </div>
        )}
        
        {isDenied && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm font-medium flex items-center">
              <i className="fas fa-times-circle mr-2"></i>
              Denied
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <button 
            onClick={() => handleApprove(task.id)}
            disabled={isApproved || isDenied}
            className={`flex-1 py-2 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 ${
              isApproved 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : isDenied
                ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5'
            }`}
          >
            <i className="fas fa-check"></i>
            <span>{isApproved ? 'Approved' : 'Approve'}</span>
          </button>
          <button 
            onClick={() => handleDeny(task.id)}
            disabled={isApproved || isDenied}
            className={`flex-1 py-2 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 ${
              isDenied 
                ? 'bg-red-600 text-white cursor-not-allowed' 
                : isApproved
                ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5'
            }`}
          >
            <i className="fas fa-times"></i>
            <span>{isDenied ? 'Denied' : 'Deny'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => handleStatCardClick('Total Employees')} className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-users text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-200"></i>
            <span className="text-sm text-gray-400">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">156</h3>
          <p className="text-gray-400 text-sm">Total Employees</p>
        </div>
        
        <div onClick={() => handleStatCardClick('Pending Tasks')} className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-tasks text-2xl text-teal-400 group-hover:scale-110 transition-transform duration-200"></i>
            <span className="text-sm text-gray-400">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'pending').length}</h3>
          <p className="text-gray-400 text-sm">Pending Tasks</p>
        </div>
        
        <div onClick={() => handleStatCardClick('Leave Requests')} className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-calendar-alt text-2xl text-purple-400 group-hover:scale-110 transition-transform duration-200"></i>
            <span className="text-sm text-gray-400">This Week</span>
          </div>
          <h3 className="text-2xl font-bold text-white">8</h3>
          <p className="text-gray-400 text-sm">Leave Requests</p>
        </div>
        
        <div onClick={() => handleStatCardClick('Productivity')} className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <i className="fas fa-chart-line text-2xl text-green-400 group-hover:scale-110 transition-transform duration-200"></i>
            <span className="text-sm text-gray-400">+5%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">94%</h3>
          <p className="text-gray-400 text-sm">Productivity</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={() => handleQuickAction('Add Employee')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-user-plus"></i>
            <span>Add Employee</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Generate Report')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-chart-bar"></i>
            <span>Generate Report</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Schedule Meeting')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-calendar"></i>
            <span>Schedule Meeting</span>
          </button>
          <button 
            onClick={() => handleQuickAction('Send Announcement')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-bullhorn"></i>
            <span>Send Announcement</span>
          </button>
        </div>
      </div>
      
      {/* Task Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Pending Approvals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(renderTaskCard)}
        </div>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Quick Action</h3>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="text-center py-8">
              <i className="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
              <p className="text-white text-lg font-medium mb-2">Action Triggered!</p>
              <p className="text-gray-300">Quick action "{selectedAction}" has been initiated</p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowQuickActions(false)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;