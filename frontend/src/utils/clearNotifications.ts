// Utility to clear corrupted notification data from localStorage
export const clearNotificationStorage = () => {
  try {
    localStorage.removeItem('notification-storage');
    console.log('Notification storage cleared successfully');
  } catch (error) {
    console.error('Error clearing notification storage:', error);
  }
};

// Call this function in browser console if notifications cause issues
// clearNotificationStorage();
