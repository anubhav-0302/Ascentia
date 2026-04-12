import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getAllLeaves } from '../api/leaveApi';

interface Activity {
  id: string;
  type: 'leave_requested' | 'leave_approved' | 'leave_rejected';
  title: string;
  description: string;
  actor: { name: string; id: string; };
  timestamp: Date;
  metadata?: { leaveType?: string; };
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'my_team' | 'company'>('all');

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllLeaves();
      const leaves = res.data || [];
      const mapped: Activity[] = leaves
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
        .map((l: any) => {
          const statusType =
            l.status === 'Approved' ? 'leave_approved' :
            l.status === 'Rejected' ? 'leave_rejected' :
            'leave_requested';
          const statusLabel =
            l.status === 'Approved' ? 'approved' :
            l.status === 'Rejected' ? 'rejected' :
            'submitted';
          return {
            id: String(l.id),
            type: statusType,
            title: l.status === 'Pending' ? 'Leave Request Submitted' : `Leave ${l.status}`,
            description: `${l.user?.name || 'Employee'} ${statusLabel} a ${l.type || 'leave'} request`,
            actor: { name: l.user?.name || 'Employee', id: String(l.userId) },
            timestamp: new Date(l.createdAt),
            metadata: { leaveType: l.type }
          };
        });
      setActivities(mapped);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type: Activity['type']) => {
    const iconClasses = 'w-5 h-5';
    switch (type) {
      case 'leave_requested': return <i className={`fas fa-calendar-plus text-blue-400 ${iconClasses}`}></i>;
      case 'leave_approved':  return <i className={`fas fa-calendar-check text-green-400 ${iconClasses}`}></i>;
      case 'leave_rejected':  return <i className={`fas fa-calendar-times text-red-400 ${iconClasses}`}></i>;
      default: return <i className={`fas fa-info-circle text-gray-400 ${iconClasses}`}></i>;
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const filteredActivities = activities;

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
          <button onClick={fetchActivities} className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 button-interactive">
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
                    {activity.metadata?.leaveType && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 bg-slate-600/50 text-gray-300 text-xs rounded-md">
                          <i className="fas fa-calendar mr-1"></i>
                          {activity.metadata.leaveType}
                        </span>
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
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <span className="text-xs text-teal-400 font-bold">{activity.actor.name.charAt(0)}</span>
                  </div>
                  <span className="text-xs text-gray-400">{activity.actor.name}</span>
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
