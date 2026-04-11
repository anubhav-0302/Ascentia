import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificationStore, formatNotificationTime, type Notification } from '../store/notificationStore';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use try-catch for store access
  let storeData;
  try {
    storeData = useNotificationStore();
  } catch (error) {
    console.error('Error accessing notification store:', error);
    setHasError(true);
    storeData = {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: () => {},
      markAllAsRead: () => {},
      removeNotification: () => {},
      clearNotifications: () => {},
      fetchUnreadCount: () => {},
      syncWithBackend: () => {},
    };
  }

  const {
    notifications = [],
    unreadCount = 0,
    isLoading = false,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    fetchUnreadCount,
    syncWithBackend,
  } = storeData;

  // Sync with backend on component mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await syncWithBackend();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [syncWithBackend]);

  // Periodically sync unread count to keep badge updated
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchUnreadCount();
      } catch (error) {
        console.error('Error syncing unread count:', error);
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    try {
      if (!notification.read && markAsRead) {
        markAsRead(notification.id);
      }
      
      // Navigate to action URL if provided
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    try {
      switch (type) {
        case 'success':
          return '🟢';
        case 'warning':
          return '🟡';
        case 'error':
          return '🔴';
        default:
          return '🔵';
      }
    } catch (error) {
      return '🔵';
    }
  };

  const getNotificationTypeStyles = (type: Notification['type'], isRead: boolean) => {
    try {
      const baseStyles = 'border-l-4 transition-all duration-200';
      const readStyles = 'opacity-60';
      const unreadStyles = 'bg-slate-700/30 hover:bg-slate-700/50';
      
      const typeStyles = {
        success: 'border-green-500',
        warning: 'border-yellow-500',
        error: 'border-red-500',
        info: 'border-blue-500',
      };

      return `${baseStyles} ${typeStyles[type] || 'border-blue-500'} ${isRead ? readStyles : unreadStyles}`;
    } catch (error) {
      return 'border-l-4 transition-all duration-200 border-blue-500 opacity-60';
    }
  };

  // Show error state if store failed to load
  if (hasError) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          title="Notifications temporarily unavailable"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-lg border border-slate-700/50 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && markAllAsRead && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && clearNotifications && (
                <button
                  onClick={() => clearNotifications()}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading notifications...</p>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
                <p className="text-gray-500 text-xs mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer ${getNotificationTypeStyles(notification.type, notification.read)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-lg mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                              {notification.title || 'Notification'}
                            </h4>
                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-400'}`}>
                              {notification.description || 'No description'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && markAsRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            {removeNotification && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                title="Remove notification"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp ? formatNotificationTime(notification.timestamp) : 'Just now'}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="p-3 border-t border-slate-700/50 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Close panel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
