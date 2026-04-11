import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize database with sample data if needed
export const initializeLeaveData = async () => {
  try {
    const existingRequests = await prisma.leaveRequest.count();
    
    if (existingRequests === 0) {
      console.log("🌱 Initializing leave requests database...");
      
      // Get existing users
      const users = await prisma.user.findMany();
      
      if (users.length >= 2) {
        // Create sample leave requests
        await prisma.leaveRequest.createMany({
          data: [
            {
              userId: users[0].id, // Admin user
              type: 'Annual',
              startDate: new Date('2024-03-15'),
              endDate: new Date('2024-03-17'),
              reason: 'Family vacation',
              status: 'Approved'
            },
            {
              userId: users[1].id, // Employee user
              type: 'Sick',
              startDate: new Date('2024-03-20'),
              endDate: new Date('2024-03-20'),
              reason: 'Medical appointment',
              status: 'Pending'
            }
          ]
        });
        
        console.log("✅ Sample leave requests created in database");
      }
    }
    
    const totalRequests = await prisma.leaveRequest.count();
    console.log("📊 TOTAL LEAVE REQUESTS IN DB:", totalRequests);
  } catch (error) {
    console.error("❌ Error initializing leave data:", error);
  }
};

export const getMyLeaveRequests = async (userId) => {
  try {
    const requests = await prisma.leaveRequest.findMany({
      where: { userId: parseInt(userId) },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert dates to strings for consistency
    return requests.map(request => ({
      ...request,
      startDate: request.startDate.toISOString().split('T')[0],
      endDate: request.endDate.toISOString().split('T')[0],
      createdAt: request.createdAt
    }));
  } catch (error) {
    console.error("❌ Error getting my leave requests:", error);
    return [];
  }
};

export const getAllLeaveRequests = async () => {
  try {
    const requests = await prisma.leaveRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert dates to strings for consistency
    return requests.map(request => ({
      ...request,
      startDate: request.startDate.toISOString().split('T')[0],
      endDate: request.endDate.toISOString().split('T')[0],
      createdAt: request.createdAt
    }));
  } catch (error) {
    console.error("❌ Error getting all leave requests:", error);
    return [];
  }
};

export const createLeaveRequest = async (leaveData) => {
  try {
    const newRequest = await prisma.leaveRequest.create({
      data: {
        userId: parseInt(leaveData.userId),
        type: leaveData.type,
        startDate: new Date(leaveData.startDate),
        endDate: new Date(leaveData.endDate),
        reason: leaveData.reason,
        status: 'Pending'
      },
      include: { user: true }
    });
    
    // Convert dates to strings for consistency
    const result = {
      ...newRequest,
      startDate: newRequest.startDate.toISOString().split('T')[0],
      endDate: newRequest.endDate.toISOString().split('T')[0],
      createdAt: newRequest.createdAt
    };
    
    console.log("✅ Leave request created in DB:", { id: result.id, userId: result.userId });
    return result;
  } catch (error) {
    console.error("❌ Error creating leave request:", error);
    throw error;
  }
};

export const updateLeaveRequestStatus = async (id, status) => {
  try {
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { user: true }
    });
    
    // Convert dates to strings for consistency
    const result = {
      ...updatedRequest,
      startDate: updatedRequest.startDate.toISOString().split('T')[0],
      endDate: updatedRequest.endDate.toISOString().split('T')[0],
      createdAt: updatedRequest.createdAt
    };
    
    console.log("✅ Leave request status updated in DB:", { id: result.id, status });
    return result;
  } catch (error) {
    console.error("❌ Error updating leave request status:", error);
    throw error;
  }
};

// Helper function to get users for leave requests
export const getUsers = async () => {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  } catch (error) {
    console.error("❌ Error getting users:", error);
    return [];
  }
};
