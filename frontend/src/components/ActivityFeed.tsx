import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'employee_added' | 'leave_requested' | 'leave_approved' | 'leave_rejected' | 'profile_updated' | 'birthday' | 'work_anniversary';
  title: string;
  description: string;
  actor: {
    name: string;
    avatar?: string;
    id: string;
  };
  target?: {
    name: string;
    id: string;
  };
  timestamp: Date;
  metadata?: {
    department?: string;
    leaveType?: string;
    duration?: string;
  };
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my_team' | 'company'>('all');

  // Mock activity data
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'employee_added',
      title: 'New Employee Joined',
      description: 'Sarah Chen joined as Senior Frontend Developer',
      actor: {
        name: 'Sarah Chen',
        avatar: 'https://picsum.photos/seed/sarah/40/40.jpg',
        id: '1'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      metadata: {
        department: 'Engineering'
      }
    },
    {
      id: '2',
      type: 'leave_requested',
      title: 'Leave Request Submitted',
      description: 'Michael Brown requested sick leave for 2 days',
      actor: {
        name: 'Michael Brown',
        avatar: 'https://picsum.photos/seed/michael/40/40.jpg',
        id: '2'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      metadata: {
        leaveType: 'Sick Leave',
        duration: '2 days'
      }
    },
    {
      id: '3',
      type: 'leave_approved',
      title: 'Leave Approved',
      description: 'Emma Wilson\'s vacation request was approved',
      actor: {
        name: 'John Davis',
        avatar: 'https://picsum.photos/seed/john/40/40.jpg',
        id: '3'
      },
      target: {
        name: 'Emma Wilson',
        id: '4'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      metadata: {
        leaveType: 'Vacation',
        duration: '5 days'
      }
    },
    {
      id: '4',
      type: 'profile_updated',
      title: 'Profile Updated',
      description: 'Alex Johnson updated their skills and certifications',
      actor: {
        name: 'Alex Johnson',
        avatar: 'https://picsum.photos/seed/alex/40/40.jpg',
        id: '5'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      metadata: {
        department: 'Engineering'
      }
    },
    {
      id: '5',
      type: 'work_anniversary',
      title: 'Work Anniversary',
      description: 'Lisa Anderson celebrates 3 years at Ascentia',
      actor: {
        name: 'Lisa Anderson',
        avatar: 'https://picsum.photos/seed/lisa/40/40.jpg',
        id: '6'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago,
      metadata: {
        department: 'Marketing'
      }
    },
    {
      id: '6',
      type: 'birthday',
      title: 'Birthday',
      description: 'David Martinez is celebrating their birthday today!',
      actor: {
        name: 'David Martinez',
        avatar: 'https://picsum.photos/seed/david/40/40.jpg',
        id: '7'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      metadata: {
        department: 'Sales'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);

    // Simulate real-time updates
    const interval = setInterval(() => {
      // In a real app, this would be a WebSocket connection
      // const newActivity: Activity = {
      //   id: Date.now().toString(),
      //   type: 'profile_updated',
      //   title: 'Profile Updated',
      //   description: 'Someone updated their profile',
      //   actor: {
      //     name: 'Active User',
      //     avatar: 'https://picsum.photos/seed/user/40/40.jpg',
      //     id: 'random'
      //   },
      //   timestamp: new Date()
      // };
      
      // Uncomment to simulate real-time updates
      // setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    const iconClasses = 'w-5 h-5';
    
    switch (type) {
      case 'employee_added':
        return <i className={`fas fa-user-plus text-green-400 ${iconClasses}`}></i>;
      case 'leave_requested':
        return <i className={`fas fa-calendar-plus text-blue-400 ${iconClasses}`}></i>;
      case 'leave_approved':
        return <i className={`fas fa-calendar-check text-green-400 ${iconClasses}`}></i>;
      case 'leave_rejected':
        return <i className={`fas fa-calendar-times text-red-400 ${iconClasses}`}></i>;
      case 'profile_updated':
        return <i className={`fas fa-user-edit text-purple-400 ${iconClasses}`}></i>;
      case 'birthday':
        return <i className={`fas fa-birthday-cake text-pink-400 ${iconClasses}`}></i>;
      case 'work_anniversary':
        return <i className={`fas fa-award text-yellow-400 ${iconClasses}`}></i>;
      default:
        return <i className={`fas fa-info-circle text-gray-400 ${iconClasses}`}></i>;
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const filteredActivities = activities.filter(() => {
    if (filter === 'all') return true;
    // In a real app, you'd filter based on user's team/department
    return true;
  });

  if (loading) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Activity Feed</h2>
          <div className="flex space-x-2">
            <div className="h-8 w-20 bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-10 h-10 bg-slate-600 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 shadow-md animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Activity Feed</h2>
        <div className="flex items-center space-x-2">
          {/* Filter Buttons */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('my_team')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                filter === 'my_team'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              My Team
            </button>
            <button
              onClick={() => setFilter('company')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
                filter === 'company'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Company
            </button>
          </div>
          
          {/* Refresh Button */}
          <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 button-interactive">
            <i className="fas fa-sync-alt text-sm"></i>
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-inbox text-gray-500 text-3xl mb-3"></i>
            <p className="text-gray-400">No recent activities</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-700/40 transition-all duration-200 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Activity Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-400 mb-2">
                      {activity.description}
                    </p>
                    
                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {activity.metadata.department && (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-600/50 text-gray-300 text-xs rounded-md">
                            <i className="fas fa-building mr-1"></i>
                            {activity.metadata.department}
                          </span>
                        )}
                        {activity.metadata.leaveType && (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-600/50 text-gray-300 text-xs rounded-md">
                            <i className="fas fa-calendar mr-1"></i>
                            {activity.metadata.leaveType}
                          </span>
                        )}
                        {activity.metadata.duration && (
                          <span className="inline-flex items-center px-2 py-1 bg-slate-600/50 text-gray-300 text-xs rounded-md">
                            <i className="fas fa-clock mr-1"></i>
                            {activity.metadata.duration}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>

                {/* Actor Info */}
                <div className="flex items-center space-x-2 mt-2">
                  <img
                    src={activity.actor.avatar}
                    alt={activity.actor.name}
                    className="w-6 h-6 rounded-full border border-slate-600"
                  />
                  <span className="text-xs text-gray-400">
                    {activity.actor.name}
                    {activity.target && (
                      <>
                        {' → '}
                        <span className="text-gray-300">{activity.target.name}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button className="w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200">
          View All Activities →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
