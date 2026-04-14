import prisma from './lib/prisma.js';
import { logDatabaseOperation } from './databaseLogger.js';

// GET /api/timesheet - Get timesheet entries for current user
const getMyTimesheet = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {
      employeeId: req.user.id
    };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const timesheets = await prisma.timesheet.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`📊 getMyTimesheet: ${timesheets.length} entries for user ${req.user.id}`);
    res.json({ success: true, data: timesheets });
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
    const { startDate, endDate, employeeId, status } = req.query;
    
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
    
    if (status) {
      whereClause.status = status;
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
    
    console.log(`📊 getAllTimesheets: ${timesheets.length} entries`);
    res.json({ success: true, data: timesheets });
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
        message: 'Hours must be between 0 and 24' 
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
    }
    res.json({ success: true, data: timesheet });
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
          message: 'Hours must be between 0 and 24' 
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

export {
  getMyTimesheet,
  getAllTimesheets,
  createTimesheetEntry,
  updateTimesheetEntry,
  approveTimesheetEntry,
  deleteTimesheetEntry,
  getTimesheetHistory
};
