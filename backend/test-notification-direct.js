// Test notification creation directly without HTTP
import { createLeaveStatusUpdateNotifications } from './notificationStoreDB.js';

async function testNotificationDirectly() {
  console.log('🧪 Testing notification creation directly...');
  
  try {
    const testLeaveRequest = {
      id: 999,
      userId: 2, // Employee user
      type: 'Sick Leave',
      startDate: '2024-12-25',
      endDate: '2024-12-26',
      reason: 'Direct test'
    };

    console.log('📝 Creating rejection notification for employee...');
    const notifications = await createLeaveStatusUpdateNotifications(testLeaveRequest, 'Rejected', 1); // Admin ID 1
    
    console.log('✅ Notifications created:', notifications.length);
    notifications.forEach((n, i) => {
      console.log(`  ${i+1}. User ${n.userId}: ${n.title} - ${n.description}`);
    });

    // Check if employee (user 2) got the notification
    const employeeNotification = notifications.find(n => n.userId === 2);
    const adminNotification = notifications.find(n => n.userId === 1);

    console.log('\n📊 Results:');
    console.log(`Employee got notification: ${employeeNotification ? 'YES' : 'NO'}`);
    console.log(`Admin got notification: ${adminNotification ? 'YES' : 'NO'}`);

    if (employeeNotification && !adminNotification) {
      console.log('✅ SUCCESS: Only employee got rejection notification');
    } else if (employeeNotification && adminNotification) {
      console.log('⚠️ WARNING: Both employee and admin got notifications');
    } else if (!employeeNotification && adminNotification) {
      console.log('❌ FAILED: Only admin got notification (wrong!)');
    } else {
      console.log('❌ FAILED: Nobody got notification');
    }

    // Now test with approval
    console.log('\n📝 Creating approval notification...');
    const approvalNotifications = await createLeaveStatusUpdateNotifications(testLeaveRequest, 'Approved', 1);
    
    console.log('✅ Approval notifications created:', approvalNotifications.length);
    approvalNotifications.forEach((n, i) => {
      console.log(`  ${i+1}. User ${n.userId}: ${n.title} - ${n.description}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testNotificationDirectly();
