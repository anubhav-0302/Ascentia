import fs from 'fs';
import path from 'path';
import { logDatabaseOperation } from './databaseLogger.js';

// Resolve a user by ID from database
const resolveUser = async (userId) => {
  try {
    const { default: prisma } = await import('./lib/prisma.js');
    const u = await prisma.user.findUnique({ where: { id: parseInt(userId) }, select: { id: true, name: true, email: true, role: true } });
    return u || { id: userId, name: 'Unknown User' };
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

// Initialize database with sample data if needed
export const initializeLeaveData = async () => {
  try {
    const existingRequests = readLeaveRequests();
    
    if (existingRequests.length === 0) {
      console.log("🌱 Initializing leave requests database...");
      
      // Create sample leave requests
      const sampleLeaveRequests = [
        {
          id: 1,
          userId: 2, // Employee user
          type: 'Sick Leave',
          startDate: '2024-01-15',
          endDate: '2024-01-16',
          reason: 'Medical appointment and recovery',
          status: 'Pending',
          createdAt: new Date('2024-01-10T10:00:00Z').toISOString()
        },
        {
          id: 2,
          userId: 2, // Employee user
          type: 'Annual Leave',
          startDate: '2024-02-10',
          endDate: '2024-02-12',
          reason: 'Family vacation',
          status: 'Approved',
          createdAt: new Date('2024-01-20T14:30:00Z').toISOString()
        }
      ];
      
      writeLeaveRequests(sampleLeaveRequests);
      console.log("✅ Sample leave requests created in database");
    }
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
    return leaveRequests;
  } catch (error) {
    console.error("❌ Error getting all leave requests:", error);
    return [];
  }
};

// Create a new leave request
export const createLeaveRequest = async (leaveData) => {
  try {
    const leaveRequests = readLeaveRequests();
    
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
