import fs from 'fs';
import path from 'path';
import { logDatabaseOperation } from './databaseLogger.js';

// Resolve a user by ID from database - now works with Employee model
const resolveUser = async (userId) => {
  try {
    const { default: prisma } = await import('./lib/prisma.js');
    const employee = await prisma.employee.findUnique({ 
      where: { id: parseInt(userId) }, 
      select: { id: true, name: true, email: true, role: true, jobTitle: true, department: true } 
    });
    return employee || { id: userId, name: 'Unknown User' };
  } catch (_) {
    return { id: userId, name: 'Unknown User' };
  }
};

// Simple file-based database for leave requests
const DB_FILE = path.join(process.cwd(), 'data', 'leaveRequests.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read leave requests from file
const readLeaveRequests = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading leave requests:', error);
    return [];
  }
};

// Write leave requests to file
const writeLeaveRequests = (leaveRequests) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(leaveRequests, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing leave requests:', error);
    return false;
  }
};

// Initialize leave requests database (ensure data directory exists)
export const initializeLeaveData = async () => {
  try {
    ensureDataDir();
    console.log("✅ Leave requests database initialized");
  } catch (error) {
    console.error("❌ Error initializing leave data:", error);
  }
};

// Get leave requests for a specific user
export const getMyLeaveRequests = async (userId) => {
  try {
    const leaveRequests = readLeaveRequests();
    return leaveRequests.filter(request => request.userId === parseInt(userId));
  } catch (error) {
    console.error("❌ Error getting my leave requests:", error);
    return [];
  }
};

// Get all leave requests (admin only)
export const getAllLeaveRequests = async () => {
  try {
    const leaveRequests = readLeaveRequests();
    
    // Populate user data for each leave request
    const leaveRequestsWithUsers = await Promise.all(
      leaveRequests.map(async (request) => {
        const user = await resolveUser(request.userId);
        return { ...request, user };
      })
    );
    
    return leaveRequestsWithUsers;
  } catch (error) {
    console.error("❌ Error getting all leave requests:", error);
    return [];
  }
};

// Create a new leave request
export const createLeaveRequest = async (leaveData) => {
  try {
    const leaveRequests = readLeaveRequests();
    
    // Check for overlapping leave requests for the same user
    const newStart = new Date(leaveData.startDate);
    const newEnd = new Date(leaveData.endDate);
    
    const overlappingRequest = leaveRequests.find(req => 
      req.userId === parseInt(leaveData.userId) &&
      req.status !== 'Rejected' && // Only check non-rejected requests
      (
        // New request starts during an existing request
        (newStart >= new Date(req.startDate) && newStart <= new Date(req.endDate)) ||
        // New request ends during an existing request
        (newEnd >= new Date(req.startDate) && newEnd <= new Date(req.endDate)) ||
        // New request completely contains an existing request
        (newStart <= new Date(req.startDate) && newEnd >= new Date(req.endDate))
      )
    );
    
    if (overlappingRequest) {
      throw new Error('You already have a leave request that overlaps with these dates');
    }
    
    const newLeaveRequest = {
      id: Date.now(), // Simple ID generation
      ...leaveData,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    leaveRequests.push(newLeaveRequest);
    const success = writeLeaveRequests(leaveRequests);
    
    if (!success) {
      throw new Error('Failed to save leave request');
    }
    
    // Log the database operation
    logDatabaseOperation('CREATE', 'leave_request', {
      leaveRequestId: newLeaveRequest.id,
      userId: leaveData.userId,
      type: leaveData.type,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      status: 'Pending'
    }, leaveData.userId);
    
    const user = await resolveUser(leaveData.userId);
    return { ...newLeaveRequest, user };
  } catch (error) {
    console.error("❌ Error creating leave request:", error);
    throw error;
  }
};

// Cancel leave request (employee can cancel their own pending request)
export const cancelLeaveRequest = async (id, userId) => {
  try {
    const leaveRequests = readLeaveRequests();
    const requestIndex = leaveRequests.findIndex(req => req.id === parseInt(id));

    if (requestIndex === -1) return null;

    const leave = leaveRequests[requestIndex];

    if (leave.userId !== parseInt(userId)) {
      throw new Error('Unauthorized: You can only cancel your own leave requests');
    }

    if (leave.status !== 'Pending') {
      throw new Error('Only pending leave requests can be cancelled');
    }

    leaveRequests.splice(requestIndex, 1);
    writeLeaveRequests(leaveRequests);

    logDatabaseOperation('DELETE', 'leave_request', { leaveRequestId: parseInt(id), userId }, userId);

    return leave;
  } catch (error) {
    console.error('❌ Error cancelling leave request:', error);
    throw error;
  }
};

// Update leave request status
export const updateLeaveRequestStatus = async (id, status) => {
  try {
    const leaveRequests = readLeaveRequests();
    const requestIndex = leaveRequests.findIndex(req => req.id === parseInt(id));
    
    if (requestIndex === -1) {
      return null;
    }
    
    const previousStatus = leaveRequests[requestIndex].status;
    leaveRequests[requestIndex].status = status;
    const success = writeLeaveRequests(leaveRequests);
    
    if (!success) {
      throw new Error('Failed to update leave request');
    }
    
    // Log the database operation
    logDatabaseOperation('UPDATE', 'leave_request', {
      leaveRequestId: parseInt(id),
      previousStatus,
      newStatus: status,
      userId: leaveRequests[requestIndex].userId
    });
    
    const user = await resolveUser(leaveRequests[requestIndex].userId);
    return { ...leaveRequests[requestIndex], user };
  } catch (error) {
    console.error("❌ Error updating leave request status:", error);
    throw error;
  }
};
