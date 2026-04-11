import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  initializeFromStorage: () => void;
}

// API functions
const fetchNotificationsFromAPI = async (): Promise<Notification[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    
    const response = await fetch('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data.map((notification: any) => ({
      ...notification,
      timestamp: new Date(notification.createdAt)
    }));
  } catch (error) {
    console.error('Error fetching notifications from API:', error);
    return [];
  }
};

const fetchUnreadCountFromAPI = async (): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return 0;
    
    const response = await fetch('/api/notifications/unread-count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return 0;
    
    const data = await response.json();
    return data.data.unreadCount || 0;
  } catch (error) {
    console.error('Error fetching unread count from API:', error);
    return 0;
  }
};

const markAsReadInAPI = async (id: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const response = await fetch(`/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error marking notification as read in API:', error);
    return false;
  }
};

const markAllAsReadInAPI = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const response = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error marking all notifications as read in API:', error);
    return false;
  }
};

const clearNotificationsInAPI = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const response = await fetch('/api/notifications', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error clearing notifications in API:', error);
    return false;
  }
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          read: false,
        };

        set((state) => {
          const updatedNotifications = [newNotification, ...state.notifications];
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.read).length,
          };
        });
      },

      markAsRead: async (id) => {
        // Try to sync with backend first
        const success = await markAsReadInAPI(id);
        
        if (success) {
          set((state) => {
            const updatedNotifications = state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            );
            return {
              notifications: updatedNotifications,
              unreadCount: updatedNotifications.filter((n) => !n.read).length,
            };
          });
        }
      },

      markAllAsRead: async () => {
        // Try to sync with backend first
        const success = await markAllAsReadInAPI();
        
        if (success) {
          set((state) => ({
            notifications: state.notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
            unreadCount: 0,
          }));
        }
      },

      clearNotifications: async () => {
        // Try to sync with backend first
        const success = await clearNotificationsInAPI();
        
        if (success) {
          set({ notifications: [], unreadCount: 0 });
        }
      },

      removeNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(
            (notification) => notification.id !== id
          );
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.read).length,
          };
        });
      },

      fetchNotifications: async () => {
        set({ isLoading: true });
        try {
          const notifications = await fetchNotificationsFromAPI();
          set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error fetching notifications:', error);
          set({ isLoading: false });
        }
      },

      fetchUnreadCount: async () => {
        try {
          const unreadCount = await fetchUnreadCountFromAPI();
          set({ unreadCount });
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      },

      syncWithBackend: async () => {
        await get().fetchNotifications();
        await get().fetchUnreadCount();
      },

      initializeFromStorage: () => {
        // This function is called when the store is hydrated from localStorage
        const state = get();
        const unreadCount = state.notifications.filter((n) => !n.read).length;
        if (state.unreadCount !== unreadCount) {
          set({ unreadCount });
        }
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount 
      }),
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          
          try {
            const parsed = JSON.parse(item);
            // Convert timestamp strings back to Date objects
            if (parsed.state?.notifications) {
              parsed.state.notifications = parsed.state.notifications.map((notification: any) => ({
                ...notification,
                timestamp: new Date(notification.timestamp)
              }));
            }
            return parsed;
          } catch (error) {
            console.error('Error parsing notification storage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.error('Error setting notification storage:', error);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Error removing notification storage:', error);
          }
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔔 Notification store rehydrated from storage');
        if (state) {
          state.initializeFromStorage();
        }
      },
    }
  )
);

// Helper functions to create notifications
export const createEmployeeNotification = (action: 'added' | 'deleted' | 'updated', employeeName: string) => {
  const messages = {
    added: {
      title: 'Employee Added',
      description: `${employeeName} has been added to the directory.`,
      type: 'success' as const,
    },
    deleted: {
      title: 'Employee Removed',
      description: `${employeeName} has been removed from the directory.`,
      type: 'warning' as const,
    },
    updated: {
      title: 'Employee Updated',
      description: `${employeeName}'s information has been updated.`,
      type: 'info' as const,
    },
  };

  return messages[action];
};

export const createLeaveNotification = (action: 'requested' | 'approved' | 'rejected', employeeName: string, leaveType?: string) => {
  const messages = {
    requested: {
      title: 'Leave Requested',
      description: `${employeeName} has requested ${leaveType || 'leave'}.`,
      type: 'info' as const,
    },
    approved: {
      title: 'Leave Approved',
      description: `${employeeName}'s ${leaveType || 'leave'} request has been approved.`,
      type: 'success' as const,
    },
    rejected: {
      title: 'Leave Rejected',
      description: `${employeeName}'s ${leaveType || 'leave'} request has been rejected.`,
      type: 'error' as const,
    },
  };

  return messages[action];
};

export const formatNotificationTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
};
