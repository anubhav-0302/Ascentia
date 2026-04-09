// In-memory leave store for testing leave functionality
import { getUsers } from './userStore.js';

let leaveRequests = [];

// Initialize with sample leave requests
const sampleLeaveRequests = [
  {
    id: 1,
    userId: 1,
    type: 'Annual',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    reason: 'Family vacation',
    status: 'Approved',
    createdAt: new Date('2024-03-01'),
    user: {
      id: 1,
      name: 'Admin User',
      email: 'admin@ascentia.com',
      role: 'admin'
    }
  },
  {
    id: 2,
    userId: 2,
    type: 'Sick',
    startDate: '2024-03-20',
    endDate: '2024-03-20',
    reason: 'Medical appointment',
    status: 'Pending',
    createdAt: new Date('2024-03-10'),
    user: {
      id: 2,
      name: 'Employee User',
      email: 'employee@ascentia.com',
      role: 'employee'
    }
  }
];

// Initialize the store
leaveRequests = [...sampleLeaveRequests];

console.log("✅ Sample leave requests created in memory store");
console.log("📊 TOTAL LEAVE REQUESTS:", leaveRequests.length);

export const getLeaveRequests = () => leaveRequests;
export const getMyLeaveRequests = (userId) => leaveRequests.filter(lr => lr.userId === userId);
export const getAllLeaveRequests = () => leaveRequests;
export const createLeaveRequest = (leaveData) => {
  // Get the actual user from user store
  const users = getUsers();
  const user = users.find(u => u.id === leaveData.userId);
  
  const newLeaveRequest = {
    id: leaveRequests.length + 1,
    ...leaveData,
    status: 'Pending',
    createdAt: new Date(),
    user: user || {
      id: leaveData.userId,
      name: 'Unknown User',
      email: 'unknown@ascentia.com',
      role: 'unknown'
    }
  };
  leaveRequests.push(newLeaveRequest);
  return newLeaveRequest;
};
export const updateLeaveRequestStatus = (id, status) => {
  const index = leaveRequests.findIndex(lr => lr.id === parseInt(id));
  if (index !== -1) {
    leaveRequests[index].status = status;
    return leaveRequests[index];
  }
  return null;
};
