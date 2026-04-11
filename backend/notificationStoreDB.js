// In-memory notification store for testing notification functionality
// Helper function to get all users for notification routing
export const getAllUsers = async () => {
  try {
    // Import from userStore to get users
    const { getUsers } = await import('./userStore.js');
    return getUsers();
  } catch (error) {
    console.error("❌ Error getting all users:", error);
    return [];
  }
};

// Helper function to get admin users
export const getAdminUsers = async () => {
  try {
    const users = await getAllUsers();
    return users.filter(user => user.role === 'admin');
  } catch (error) {
    console.error("❌ Error getting admin users:", error);
    return [];
  }
};

// Helper function to get user by ID
export const getUserById = async (userId) => {
  try {
    const { getUsers } = await import('./userStore.js');
    const users = getUsers();
    return users.find(u => u.id === parseInt(userId)) || null;
  } catch (error) {
    console.error("❌ Error getting user by ID:", error);
    return null;
  }
};

// Initialize notification model if it doesn't exist in schema
// For now, we'll use a simple in-memory store for notifications with database persistence
let notifications = [];

// Create notification for specific users
export const createNotification = async (notificationData) => {
  try {
    const { targetUserIds, title, description, type, actionUrl } = notificationData;
    
    const newNotifications = targetUserIds.map(userId => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: parseInt(userId),
      title,
      description,
      type: type || 'info',
      actionUrl: actionUrl || null,
      read: false,
      createdAt: new Date()
    }));
    
    notifications.push(...newNotifications);
    
    console.log("✅ Notifications created:", {
      count: newNotifications.length,
      title,
      targetUserIds
    });
    
    return newNotifications;
  } catch (error) {
    console.error("❌ Error creating notifications:", error);
    return [];
  }
};

// Get notifications for a specific user
export const getUserNotifications = async (userId) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === parseInt(userId));
    return userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("❌ Error getting user notifications:", error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = notifications.find(n => 
      n.id === notificationId && n.userId === parseInt(userId)
    );
    
    if (notification) {
      notification.read = true;
      console.log("✅ Notification marked as read:", notificationId);
      return notification;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return null;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === parseInt(userId));
    userNotifications.forEach(notification => {
      notification.read = true;
    });
    
    console.log("✅ All notifications marked as read for user:", userId);
    return userNotifications.length;
  } catch (error) {
    console.error("❌ Error marking all notifications as read:", error);
    return 0;
  }
};

// Clear all notifications for a user
export const clearUserNotifications = async (userId) => {
  try {
    const beforeCount = notifications.length;
    notifications = notifications.filter(n => n.userId !== parseInt(userId));
    const clearedCount = beforeCount - notifications.length;
    
    console.log("✅ Cleared notifications for user:", { userId, count: clearedCount });
    return clearedCount;
  } catch (error) {
    console.error("❌ Error clearing user notifications:", error);
    return 0;
  }
};

// Get unread count for a user
export const getUnreadNotificationCount = async (userId) => {
  try {
    const unreadCount = notifications.filter(n => 
      n.userId === parseInt(userId) && !n.read
    ).length;
    
    return unreadCount;
  } catch (error) {
    console.error("❌ Error getting unread notification count:", error);
    return 0;
  }
};

// Leave-specific notification functions
export const createLeaveRequestNotifications = async (leaveRequest) => {
  try {
    // When an employee requests leave, notify only admins
    const adminUsers = await getAdminUsers();
    
    if (adminUsers.length === 0) {
      console.log("⚠️ No admin users found to notify");
      return [];
    }
    
    const adminUserIds = adminUsers.map(admin => admin.id);
    
    return await createNotification({
      targetUserIds: adminUserIds,
      title: 'Leave Request Submitted',
      description: `${leaveRequest.user.name} has requested ${leaveRequest.type} leave from ${leaveRequest.startDate} to ${leaveRequest.endDate}`,
      type: 'info',
      actionUrl: '/leave-attendance'
    });
  } catch (error) {
    console.error("❌ Error creating leave request notifications:", error);
    return [];
  }
};

export const createLeaveStatusUpdateNotifications = async (leaveRequest, newStatus) => {
  try {
    const notifications = [];
    
    // Always notify the employee who requested the leave
    notifications.push(await createNotification({
      targetUserIds: [leaveRequest.userId],
      title: `Leave Request ${newStatus}`,
      description: `Your ${leaveRequest.type} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been ${newStatus.toLowerCase()}`,
      type: newStatus === 'Approved' ? 'success' : 'error',
      actionUrl: '/leave-attendance'
    }));
    
    // Also notify other admins about the action taken (but not the admin who took it)
    const adminUsers = await getAdminUsers();
    const otherAdmins = adminUsers.filter(admin => admin.id !== leaveRequest.userId); // Exclude the requesting user if they're admin
    
    if (otherAdmins.length > 0) {
      const otherAdminIds = otherAdmins.map(admin => admin.id);
      
      notifications.push(await createNotification({
        targetUserIds: otherAdminIds,
        title: `Leave Request ${newStatus}`,
        description: `${leaveRequest.user.name}'s ${leaveRequest.type} leave request has been ${newStatus.toLowerCase()}`,
        type: 'info',
        actionUrl: '/leave-attendance'
      }));
    }
    
    return notifications.flat();
  } catch (error) {
    console.error("❌ Error creating leave status update notifications:", error);
    return [];
  }
};

// Employee-specific notification functions
export const createEmployeeActionNotifications = async (employee, action, currentUserId) => {
  try {
    const notifications = [];
    
    // For employee actions, notify all admins
    const adminUsers = await getAdminUsers();
    const otherAdmins = adminUsers.filter(admin => admin.id !== currentUserId);
    
    if (otherAdmins.length > 0) {
      const adminUserIds = otherAdmins.map(admin => admin.id);
      
      const actionMessages = {
        added: {
          title: 'Employee Added',
          description: `${employee.name} has been added to the directory`,
          type: 'success'
        },
        updated: {
          title: 'Employee Updated',
          description: `${employee.name}'s information has been updated`,
          type: 'info'
        },
        deleted: {
          title: 'Employee Removed',
          description: `${employee.name} has been removed from the directory`,
          type: 'warning'
        }
      };
      
      const message = actionMessages[action];
      if (message) {
        notifications.push(await createNotification({
          targetUserIds: adminUserIds,
          title: message.title,
          description: message.description,
          type: message.type,
          actionUrl: '/directory'
        }));
      }
    }
    
    return notifications.flat();
  } catch (error) {
    console.error("❌ Error creating employee action notifications:", error);
    return [];
  }
};
