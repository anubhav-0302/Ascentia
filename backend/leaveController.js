import { getMyLeaveRequests as getMyLeaveRequestsFromDB, getAllLeaveRequests as getAllLeaveRequestsFromDB, createLeaveRequest as createLeaveRequestInDB, updateLeaveRequestStatus as updateLeaveRequestStatusInDB, cancelLeaveRequest as cancelLeaveRequestFromDB, initializeLeaveData } from './leaveStoreDB.js';
import { createLeaveRequestNotifications, createLeaveStatusUpdateNotifications } from './notificationStoreDB.js';
import { tenantWhere, tenantWhereWith } from './helpers/tenantHelper.js';
import { getAccessibleEmployeeIds } from './helpers/accessControlHelper.js';
import prisma from './lib/prisma.js';

// Initialize database on module load
initializeLeaveData().catch(console.error);

// GET /api/leave/my - Get my leave requests
export const getMyLeaveRequests = async (req, res) => {
  try {
    // console.log("🔍 Fetching my leave requests for user:", req.user.id);
    const leaveRequests = await getMyLeaveRequestsFromDB(req.user.id);
    
    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    console.error("❌ GET MY LEAVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message
    });
  }
};

// GET /api/leave - Get all leave requests (admin/hr/manager/teamlead)
export const getAllLeaveRequests = async (req, res) => {
  try {
    const userRole = req.user.role.toLowerCase();
    const userId = req.user.id;
    
    let leaveRequests = await getAllLeaveRequestsFromDB();
    
    // Filter by tenant first
    const orgEmployees = await prisma.employee.findMany({
      where: tenantWhere(req),
      select: { id: true, managerId: true }
    });
    const orgEmployeeIds = orgEmployees.map(emp => emp.id);
    // Leave requests use 'userId' field (not 'employeeId')
    leaveRequests = leaveRequests.filter(l => orgEmployeeIds.includes(l.userId));
    
    // Filter data based on user role using access control helper
    if (!['admin', 'hr'].includes(userRole)) {
      const accessibleIds = await getAccessibleEmployeeIds(userId, userRole, req.user.organizationId);
      leaveRequests = leaveRequests.filter(l => accessibleIds.includes(l.userId));
    }
    // Admin and HR see all requests (no additional filtering)
    
    // Enrich each leave with the employee's managerId for frontend authorization
    const managerIdMap = {};
    orgEmployees.forEach(emp => {
      managerIdMap[emp.id] = emp.managerId;
    });
    leaveRequests = leaveRequests.map(l => ({
      ...l,
      employeeId: l.userId,
      managerId: managerIdMap[l.userId] || null
    }));
    
    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    console.error("❌ GET ALL LEAVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all leave requests",
      error: error.message
    });
  }
};

// POST /api/leave - Create leave request
export const createLeaveRequest = async (req, res) => {
  try {
    // console.log("🔍 Creating leave request:", req.body);
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Type, start date, end date, and reason are required'
      });
    }
    
    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range (allow same-day leave)
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after or same as start date'
      });
    }
    
    // Validate reason is not empty (optional improvement)
    if (reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reason cannot be empty'
      });
    }
    
    const newLeaveRequest = await createLeaveRequestInDB({
      userId,
      type,
      startDate,
      endDate,
      reason
    });
    
    // console.log("✅ Leave request created:", { id: newLeaveRequest.id, userId });
    
    // Create notifications for admins only (not the requesting employee)
    await createLeaveRequestNotifications(newLeaveRequest);
    
    res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: newLeaveRequest
    });
  } catch (error) {
    console.error("❌ CREATE LEAVE ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

// DELETE /api/leave/:id - Cancel leave request (employee only, pending only)
export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const cancelled = await cancelLeaveRequestFromDB(id, userId);

    if (!cancelled) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('❌ CANCEL LEAVE ERROR:', error);
    const status = error.message.startsWith('Unauthorized') ? 403 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/:id - Update leave request status (admin/HR or assigned manager only)
export const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approverId = req.user.id;
    const userRole = req.user.role.toLowerCase();
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Approved or Rejected) is required'
      });
    }
    
    // Fetch the leave request to find the employee
    const leaveRequests = await getAllLeaveRequestsFromDB();
    const leaveRequest = leaveRequests.find(l => l.id === parseInt(id));
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    // Authorization: admin/HR can approve any leave, managers can only approve their direct reports
    if (!['admin', 'hr'].includes(userRole)) {
      const employee = await prisma.employee.findUnique({
        where: { id: leaveRequest.userId },
        select: { managerId: true }
      });
      
      if (!employee || employee.managerId !== approverId) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned manager, admin, or HR can approve/reject this leave request'
        });
      }
    }
    
    const updatedLeaveRequest = await updateLeaveRequestStatusInDB(id, status);
    
    if (!updatedLeaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    // Create notifications for the employee and other admins
    await createLeaveStatusUpdateNotifications(updatedLeaveRequest, status, approverId);
    
    res.json({
      success: true,
      message: 'Leave request status updated successfully',
      data: updatedLeaveRequest
    });
  } catch (error) {
    console.error("❌ UPDATE LEAVE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request status',
      error: error.message
    });
  }
};
