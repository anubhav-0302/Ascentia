// Debug notification creation process
import { createLeaveRequestNotifications } from './notificationStoreDB.js';

const testLeaveRequest = {
  id: 999,
  userId: 2,
  type: 'Test Leave',
  startDate: '2024-12-25',
  endDate: '2024-12-26',
  reason: 'Test notification creation',
  status: 'Pending',
  user: {
    id: 2,
    name: 'Test Employee',
    email: 'test@test.com'
  }
};

async function debugNotificationCreation() {
  console.log('🔍 Debugging notification creation...');
  
  try {
    console.log('📝 Creating notifications for test leave request...');
    const result = await createLeaveRequestNotifications(testLeaveRequest);
    console.log('✅ Notification creation result:', result);
    
    // Check if notifications were actually stored
    const { getUserNotifications } = await import('./notificationStoreDB.js');
    
    // Check admin notifications (user ID 1)
    const adminNotifications = await getUserNotifications(1);
    console.log('📋 Admin notifications after creation:', adminNotifications);
    
    // Check employee notifications (user ID 2)
    const employeeNotifications = await getUserNotifications(2);
    console.log('📋 Employee notifications after creation:', employeeNotifications);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugNotificationCreation();
