import prisma from './lib/prisma.js';
import { logDatabaseOperation } from './databaseLogger.js';

// GET /api/timesheet - Get timesheet entries for current user
const getMyTimesheet = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const whereClause = {
      employeeId: req.user.id
    };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    // Get total count for pagination
    const total = await prisma.timesheet.count({ where: whereClause });
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      skip,
      take,
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`📊 getMyTimesheet: ${timesheets.length} entries for user ${req.user.id} (page ${page}, limit ${limit})`);
    res.json({ 
      success: true, 
      data: timesheets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + take < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("❌ GET MY TIMESHEET ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch timesheet entries", 
      error: error.message 
    });
  }
};

// GET /api/timesheet/all - Get all timesheet entries (admin only)
const getAllTimesheets = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, status, page = 1, limit = 50 } = req.query;
    const userRole = req.user.role.toLowerCase();
    const userId = req.user.id;
    
    const whereClause = {};
    
    // Role-based filtering
    if (userRole === 'manager' || userRole === 'teamlead') {
      // Managers and Team Leads see only their direct reports
      const directReports = await prisma.employee.findMany({
        where: { managerId: userId },
        select: { id: true }
      });
      const directReportIds = directReports.map(emp => emp.id);
      whereClause.employeeId = { in: directReportIds };
    } else if (userRole === 'employee') {
      // Employees see only their own data (shouldn't reach here due to permissions)
      whereClause.employeeId = userId;
    }
    // Admin and HR see all data (no additional filtering)
    
    // Apply additional filters
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (employeeId) {
      // If specific employeeId is provided, ensure user has permission to view it
      if (userRole === 'manager' || userRole === 'teamlead') {
        // Check if this employee is a direct report
        const isDirectReport = await prisma.employee.findFirst({
          where: { 
            id: parseInt(employeeId),
            managerId: userId 
          }
        });
        if (!isDirectReport) {
          return res.status(403).json({
            success: false,
            message: "You don't have permission to view this employee's timesheet"
          });
        }
      }
      whereClause.employeeId = parseInt(employeeId);
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    // Get total count for pagination
    const total = await prisma.timesheet.count({ where: whereClause });
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      skip,
      take,
      include: {
        employee: {
          select: { id: true, name: true, email: true, department: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`📊 getAllTimesheets: ${timesheets.length} entries (page ${page}, limit ${limit})`);
    res.json({ 
      success: true, 
      data: timesheets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + take < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("❌ GET ALL TIMESHEETS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch all timesheet entries", 
      error: error.message 
    });
  }
};

// POST /api/timesheet - Create new timesheet entry
const createTimesheetEntry = async (req, res) => {
  try {
    const { date, hours, description } = req.body;
    
    if (!date || !hours) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and hours are required' 
      });
    }
    
    if (hours <= 0 || hours > 24) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hours must be greater than 0 and less than or equal to 24' 
      });
    }
    
    // Validate date is not in the future
    const entryDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    entryDate.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
    
    if (entryDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date cannot be in the future' 
      });
    }
    
    // Check if entry already exists for this date
    const existingEntry = await prisma.timesheet.findFirst({
      where: {
        employeeId: req.user.id,
        date: new Date(date)
      }
    });
    
    let timesheet;
    
    if (existingEntry) {
      // Update existing entry
      timesheet = await prisma.timesheet.update({
        where: { id: existingEntry.id },
        data: {
          hours: parseFloat(hours),
          description: description || null,
          updatedAt: new Date()
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      await logDatabaseOperation('UPDATE', 'timesheet', timesheet.id, req.user.id);
      console.log(`✅ Updated timesheet entry: ${timesheet.id}`);
      res.json({ 
        success: true, 
        data: timesheet,
        message: 'Timesheet entry updated successfully (existing entry found for this date)'
      });
    } else {
      // Create new entry
      timesheet = await prisma.timesheet.create({
        data: {
          employeeId: req.user.id,
          date: new Date(date),
          hours: parseFloat(hours),
          description: description || null
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      await logDatabaseOperation('CREATE', 'timesheet', timesheet.id, req.user.id);
      console.log(`✅ Created timesheet entry: ${timesheet.id}`);
      res.json({ 
        success: true, 
        data: timesheet,
        message: 'Timesheet entry created successfully'
      });
    }
  } catch (error) {
    console.error("❌ CREATE TIMESHEET ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create timesheet entry", 
      error: error.message 
    });
  }
};

// PUT /api/timesheet/:id - Update timesheet entry
const updateTimesheetEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours, description } = req.body;
    
    const existingEntry = await prisma.timesheet.findFirst({
      where: { id: parseInt(id) }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timesheet entry not found' 
      });
    }
    
    // Only allow update if user owns the entry or is admin
    if (existingEntry.employeeId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this entry' 
      });
    }
    
    // Don't allow updates if already approved
    if (existingEntry.status === 'Approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update approved timesheet entry' 
      });
    }
    
    const updateData = {};
    if (hours !== undefined) {
      if (hours <= 0 || hours > 24) {
        return res.status(400).json({ 
          success: false, 
          message: 'Hours must be greater than 0 and less than or equal to 24' 
        });
      }
      updateData.hours = parseFloat(hours);
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    
    const timesheet = await prisma.timesheet.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logDatabaseOperation('UPDATE', 'timesheet', timesheet.id, req.user.id);
    
    console.log(`✅ Updated timesheet entry: ${timesheet.id}`);
    res.json({ success: true, data: timesheet });
  } catch (error) {
    console.error("❌ UPDATE TIMESHEET ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update timesheet entry", 
      error: error.message 
    });
  }
};

// PUT /api/timesheet/:id/approve - Approve/reject timesheet entry
const approveTimesheetEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body; // status: "Approved" or "Rejected"
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status (Approved or Rejected) is required' 
      });
    }
    
    const existingEntry = await prisma.timesheet.findFirst({
      where: { id: parseInt(id) }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timesheet entry not found' 
      });
    }
    
    // Only admins and managers can approve
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to approve timesheet entries' 
      });
    }
    
    const timesheet = await prisma.timesheet.update({
      where: { id: parseInt(id) },
      data: {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        description: comments ? `${existingEntry.description || ''}\n\nApproval Comments: ${comments}`.trim() : existingEntry.description
      },
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logDatabaseOperation('APPROVE', 'timesheet', timesheet.id, req.user.id);
    
    console.log(`✅ Approved timesheet entry: ${timesheet.id} with status: ${status}`);
    res.json({ success: true, data: timesheet });
  } catch (error) {
    console.error("❌ APPROVE TIMESHEET ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to approve timesheet entry", 
      error: error.message 
    });
  }
};

// DELETE /api/timesheet/:id - Delete timesheet entry
const deleteTimesheetEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingEntry = await prisma.timesheet.findFirst({
      where: { id: parseInt(id) }
    });
    
    if (!existingEntry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timesheet entry not found' 
      });
    }
    
    // Only allow delete if user owns the entry or is admin
    if (existingEntry.employeeId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this entry' 
      });
    }
    
    // Don't allow deletion if already approved
    if (existingEntry.status === 'Approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete approved timesheet entry' 
      });
    }
    
    await prisma.timesheet.delete({
      where: { id: parseInt(id) }
    });
    
    await logDatabaseOperation('DELETE', 'timesheet', parseInt(id), req.user.id);
    
    console.log(`✅ Deleted timesheet entry: ${id}`);
    res.json({ success: true, message: 'Timesheet entry deleted successfully' });
  } catch (error) {
    console.error("❌ DELETE TIMESHEET ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete timesheet entry", 
      error: error.message 
    });
  }
};

// GET /api/timesheet/history - Get timesheet history for export
const getTimesheetHistory = async (req, res) => {
  try {
    const { startDate, endDate, employeeId, format = 'json' } = req.query;
    
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId);
    }
    
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: { id: true, name: true, email: true, department: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Employee Name,Employee Email,Department,Hours,Description,Status,Approved By,Approved At\n';
      const csvData = timesheets.map(ts => 
        `${ts.date.toISOString().split('T')[0]},${ts.employee.name},${ts.employee.email},${ts.employee.department},${ts.hours},"${ts.description || ''}",${ts.status},${ts.approver?.name || ''},${ts.approvedAt ? ts.approvedAt.toISOString() : ''}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="timesheet-history-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json({ success: true, data: timesheets });
    }
  } catch (error) {
    console.error("❌ GET TIMESHEET HISTORY ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch timesheet history", 
      error: error.message 
    });
  }
};

// Bulk approve/reject timesheet entries
const bulkApproveTimesheets = async (req, res) => {
  try {
    const { timesheetIds, status, comments } = req.body;
    
    if (!timesheetIds || !Array.isArray(timesheetIds) || timesheetIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Timesheet IDs array is required' 
      });
    }
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status (Approved or Rejected) is required' 
      });
    }
    
    // Only admins and managers can approve
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to approve timesheet entries' 
      });
    }
    
    const results = [];
    
    for (const id of timesheetIds) {
      try {
        const existingEntry = await prisma.timesheet.findFirst({
          where: { id: parseInt(id) }
        });
        
        if (!existingEntry) {
          results.push({ id, success: false, error: 'Timesheet entry not found' });
          continue;
        }
        
        if (existingEntry.status !== 'Pending') {
          results.push({ id, success: false, error: 'Only pending entries can be approved/rejected' });
          continue;
        }
        
        const updatedEntry = await prisma.timesheet.update({
          where: { id: parseInt(id) },
          data: {
            status,
            approvedBy: req.user.id,
            approvedAt: new Date(),
            description: comments ? `${existingEntry.description || ''}\n\nBulk Approval Comments: ${comments}`.trim() : existingEntry.description
          },
          include: {
            employee: {
              select: { id: true, name: true, email: true }
            },
            approver: {
              select: { id: true, name: true, email: true }
            }
          }
        });
        
        await logDatabaseOperation('BULK_APPROVE', 'timesheet', updatedEntry.id, req.user.id);
        results.push({ id, success: true, data: updatedEntry });
        
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`✅ Bulk ${status.toLowerCase()}: ${successCount} successful, ${failureCount} failed`);
    
    res.json({ 
      success: true, 
      message: `Successfully ${status.toLowerCase()} ${successCount} timesheet entries${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
      results,
      summary: {
        total: timesheetIds.length,
        successful: successCount,
        failed: failureCount
      }
    });
  } catch (error) {
    console.error("❌ BULK APPROVE TIMESHEETS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to bulk approve timesheet entries", 
      error: error.message 
    });
  }
};

export {
  getMyTimesheet,
  getAllTimesheets,
  createTimesheetEntry,
  updateTimesheetEntry,
  approveTimesheetEntry,
  deleteTimesheetEntry,
  getTimesheetHistory,
  bulkApproveTimesheets
};
