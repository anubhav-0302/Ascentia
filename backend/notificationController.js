import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearUserNotifications,
  getUnreadNotificationCount 
} from './notificationStoreDB.js';

// GET /api/notifications - Get user notifications
export const getUserNotificationsController = async (req, res) => {
  try {
    console.log("🔍 Fetching notifications for user:", req.user.id);
    const notifications = await getUserNotifications(req.user.id);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("❌ GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

// GET /api/notifications/unread-count - Get unread notification count
export const getUnreadCountController = async (req, res) => {
  try {
    console.log("🔍 Fetching unread count for user:", req.user.id);
    const unreadCount = await getUnreadNotificationCount(req.user.id);
    
    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error("❌ GET UNREAD COUNT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
      error: error.message
    });
  }
};

// PUT /api/notifications/:id/read - Mark notification as read
export const markAsReadController = async (req, res) => {
  try {
    console.log("🔍 Marking notification as read:", req.params.id);
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await markNotificationAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error("❌ MARK AS READ ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
};

// PUT /api/notifications/read-all - Mark all notifications as read
export const markAllAsReadController = async (req, res) => {
  try {
    console.log("🔍 Marking all notifications as read for user:", req.user.id);
    const markedCount = await markAllNotificationsAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { markedCount }
    });
  } catch (error) {
    console.error("❌ MARK ALL AS READ ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message
    });
  }
};

// DELETE /api/notifications - Clear all notifications
export const clearNotificationsController = async (req, res) => {
  try {
    console.log("🔍 Clearing all notifications for user:", req.user.id);
    const clearedCount = await clearUserNotifications(req.user.id);
    
    res.json({
      success: true,
      message: 'All notifications cleared',
      data: { clearedCount }
    });
  } catch (error) {
    console.error("❌ CLEAR NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
      error: error.message
    });
  }
};
