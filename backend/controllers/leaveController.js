import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

// Create leave request
export const createLeaveRequest = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validation
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: type, startDate, endDate, reason'
      });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        type,
        startDate: start,
        endDate: end,
        reason,
        status: 'Pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: leaveRequest
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user's leave requests
export const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Leave requests retrieved successfully',
      data: leaveRequests
    });
  } catch (error) {
    console.error('Get my leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all leave requests (admin only)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'All leave requests retrieved successfully',
      data: leaveRequests
    });
  } catch (error) {
    console.error('Get all leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update leave request status (admin only)
export const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id; // Admin who is approving/rejecting

    // Validation
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Approved" or "Rejected"'
      });
    }

    const leaveRequestId = parseInt(id);
    if (isNaN(leaveRequestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave request ID'
      });
    }

    // Check if leave request exists
    const existingRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId }
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (existingRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    // Update leave request
    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Update leave request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get leave request statistics (admin only)
export const getLeaveStatistics = async (req, res) => {
  try {
    const stats = await prisma.leaveRequest.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const total = await prisma.leaveRequest.count();

    const statistics = {
      total,
      pending: stats.find(s => s.status === 'Pending')?._count.status || 0,
      approved: stats.find(s => s.status === 'Approved')?._count.status || 0,
      rejected: stats.find(s => s.status === 'Rejected')?._count.status || 0
    };

    res.json({
      success: true,
      message: 'Leave statistics retrieved successfully',
      data: statistics
    });
  } catch (error) {
    console.error('Get leave statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveRequestStatus,
  getLeaveStatistics
};
