import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import SkeletonLoader from './SkeletonLoader';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    actorName?: string;
    actorAvatar?: string;
    relatedId?: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notification data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Leave Request Approved',
      message: 'Your vacation request for Dec 25-30 has been approved by John Davis.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      actionUrl: '/leave-attendance',
      actionText: 'View Details',
      metadata: {
        actorName: 'John Davis',
        actorAvatar: 'https://picsum.photos/seed/john/32/32.jpg'
      }
    },
    {
      id: '2',
      type: 'info',
      title: 'New Team Member',
      message: 'Sarah Chen has joined the Engineering team as Senior Frontend Developer.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionUrl: '/directory',
      actionText: 'View Profile',
      metadata: {
        actorName: 'Sarah Chen',
        actorAvatar: 'https://picsum.photos/seed/sarah/32/32.jpg',
        relatedId: 'sarah-chen'
      }
    },
    {
      id: '3',
      type: 'warning',
      title: 'Performance Review Due',
      message: 'Your quarterly performance review is scheduled for tomorrow at 2:00 PM.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      actionUrl: '/profile',
      actionText: 'Prepare Review'
    },
    {
      id: '4',
      type: 'error',
      title: 'Payroll Processing Delay',
      message: 'There was an issue processing this month\'s payroll. Please contact HR.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: true,
      actionUrl: '/payroll-benefits',
      actionText: 'Contact HR'
    },
    {
      id: '5',
      type: 'success',
      title: 'Document Uploaded',
      message: 'Your certificate has been successfully uploaded to your profile.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      actionUrl: '/profile',
      actionText: 'View Document'
    },
    {
      id: '6',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance this weekend from 2 AM to 6 AM EST.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClasses = 'w-5 h-5';
    
    switch (type) {
      case 'success':
        return <i className={`fas fa-check-circle text-green-400 ${iconClasses}`}></i>;
      case 'warning':
        return <i className={`fas fa-exclamation-triangle text-yellow-400 ${iconClasses}`}></i>;
      case 'error':
        return <i className={`fas fa-exclamation-circle text-red-400 ${iconClasses}`}></i>;
      case 'info':
      default:
        return <i className={`fas fa-info-circle text-blue-400 ${iconClasses}`}></i>;
    }
  };

  const getNotificationBg = (type: Notification['type'], read: boolean) => {
    const baseClass = 'border transition-all duration-200';
    if (read) {
      return `${baseClass} border-slate-700/30 bg-slate-700/20`;
    }
    
    switch (type) {
      case 'success':
        return `${baseClass} border-green-500/30 bg-green-500/10`;
      case 'warning':
        return `${baseClass} border-yellow-500/30 bg-yellow-500/10`;
      case 'error':
        return `${baseClass} border-red-500/30 bg-red-500/10`;
      case 'info':
      default:
        return `${baseClass} border-blue-500/30 bg-blue-500/10`;
    }
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // In a real app, you'd navigate to the action URL
      console.log('Navigate to:', notification.actionUrl);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 button-interactive"
      >
        <i className="fas fa-bell text-lg"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl z-50 animate-scaleIn">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded transition-all duration-200"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg">
                    <SkeletonLoader height={16} width="60%" className="mb-2" />
                    <SkeletonLoader height={14} width="80%" className="mb-2" />
                    <SkeletonLoader height={12} width="40%" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-bell-slash text-gray-500 text-3xl mb-3"></i>
                <p className="text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-slate-700/30 ${getNotificationBg(notification.type, notification.read)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors duration-200"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                        
                        <p className={`text-sm mb-2 ${notification.read ? 'text-gray-400' : 'text-gray-300'}`}>
                          {notification.message}
                        </p>

                        {/* Actor Info */}
                        {notification.metadata?.actorName && (
                          <div className="flex items-center space-x-2 mb-2">
                            <img
                              src={notification.metadata.actorAvatar}
                              alt={notification.metadata.actorName}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-xs text-gray-500">{notification.metadata.actorName}</span>
                          </div>
                        )}

                        {/* Action & Timestamp */}
                        <div className="flex items-center justify-between">
                          {notification.actionText && (
                            <span className="text-xs text-teal-400 hover:text-teal-300 transition-colors duration-200">
                              {notification.actionText} →
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-700/50">
            <button className="w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200">
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
