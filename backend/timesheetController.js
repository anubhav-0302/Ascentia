import prisma from './lib/prisma.js';
import { logDatabaseOperation } from './databaseLogger.js';
import { tenantWhere, tenantWhereWith } from './helpers/tenantHelper.js';

// GET /api/timesheet - Get timesheet entries for current user
const getMyTimesheet = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 50 } = req.query;
    
    const whereClause = tenantWhereWith(req, {
      employeeId: req.user.id
    });
    
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
        },
        ActivityMaster: {
          select: { id: true, name: true }
        }
      }
    });
    
    // console.log(`📊 getMyTimesheet: ${timesheets.length} entries for user ${req.user.id} (page ${page}, limit ${limit})`);
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
    
    const whereClause = tenantWhere(req);
    
    // Role-based filtering (in addition to tenant isolation)
    if (userRole === 'manager' || userRole === 'teamlead') {
      // Managers and Team Leads see only their direct reports
      const directReports = await prisma.employee.findMany({
        where: tenantWhereWith(req, { managerId: userId }),
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
        },
        ActivityMaster: {
          select: { id: true, name: true }
        }
      }
    });
    
    // console.log(`📊 getAllTimesheets: ${timesheets.length} entries (page ${page}, limit ${limit})`);
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
    const { date, hours, description, activityId } = req.body;
    
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
    
    // Check if entry already exists for this date (+ activity combination if activityId provided)
    const existingWhere = {
      employeeId: req.user.id,
      date: new Date(date),
      organizationId: req.user.organizationId
    };
    if (activityId) {
      existingWhere.activityId = activityId;
    }
    const existingEntry = await prisma.timesheet.findFirst({
      where: existingWhere
    });
    
    let timesheet;
    
    if (existingEntry) {
      // Update existing entry
      timesheet = await prisma.timesheet.update({
        where: { id: existingEntry.id },
        data: {
          hours: parseFloat(hours),
          description: description || null,
          activityId: activityId || null,
          updatedAt: new Date()
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true }
          },
          ActivityMaster: {
            select: { id: true, name: true }
          }
        }
      });
      
      await logDatabaseOperation('UPDATE', 'timesheet', timesheet.id, req.user.id);
      // console.log(`✅ Updated timesheet entry: ${timesheet.id}`);
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
          description: description || null,
          activityId: activityId || null,
          organizationId: req.user.organizationId
        },
        include: {
          employee: {
            select: { id: true, name: true, email: true }
          },
          ActivityMaster: {
            select: { id: true, name: true }
          }
        }
      });
      
      await logDatabaseOperation('CREATE', 'timesheet', timesheet.id, req.user.id);
      // console.log(`✅ Created timesheet entry: ${timesheet.id}`);
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
      where: { 
        id: parseInt(id),
        ...tenantWhere(req)
      }
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
    
    // console.log(`✅ Updated timesheet entry: ${timesheet.id}`);
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
    
    // console.log(`✅ Approved timesheet entry: ${timesheet.id} with status: ${status}`);
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
      where: { 
        id: parseInt(id),
        ...tenantWhere(req)
      }
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
    
    // console.log(`✅ Deleted timesheet entry: ${id}`);
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
    
    // console.log(`✅ Bulk ${status.toLowerCase()}: ${successCount} successful, ${failureCount} failed`);
    
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

// ===================== ACTIVITY MASTER CRUD =====================

// GET /api/timesheet/activities - Get all active activities
const getActivities = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const whereClause = {};
    
    // By default only show active activities (for employee dropdown)
    // Admin/HR can request all including inactive
    const userRole = req.user.role?.toLowerCase();
    if (includeInactive !== 'true' || !['admin', 'hr'].includes(userRole)) {
      whereClause.isActive = true;
    }
    
    const activities = await prisma.activityMaster.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        Employee: {
          select: { id: true, name: true }
        }
      }
    });
    
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("❌ GET ACTIVITIES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch activities", error: error.message });
  }
};

// POST /api/timesheet/activities - Create new activity (admin/HR only)
const createActivity = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Activity name is required' });
    }
    
    // Check for duplicate name
    const existing = await prisma.activityMaster.findFirst({
      where: { name: name.trim() }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Activity with this name already exists' });
    }
    
    const activity = await prisma.activityMaster.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: req.user.id,
        updatedAt: new Date()
      }
    });
    
    await logDatabaseOperation('CREATE', 'activityMaster', activity.id, req.user.id);
    res.json({ success: true, data: activity, message: 'Activity created successfully' });
  } catch (error) {
    console.error("❌ CREATE ACTIVITY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to create activity", error: error.message });
  }
};

// PUT /api/timesheet/activities/:id - Update activity (admin/HR only)
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    
    const existing = await prisma.activityMaster.findFirst({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    
    // Check duplicate name if name is being changed
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.activityMaster.findFirst({
        where: { name: name.trim(), id: { not: parseInt(id) } }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Activity with this name already exists' });
      }
    }
    
    const updateData = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const activity = await prisma.activityMaster.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    await logDatabaseOperation('UPDATE', 'activityMaster', activity.id, req.user.id);
    res.json({ success: true, data: activity, message: 'Activity updated successfully' });
  } catch (error) {
    console.error("❌ UPDATE ACTIVITY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update activity", error: error.message });
  }
};

// DELETE /api/timesheet/activities/:id - Delete activity (admin/HR only)
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.activityMaster.findFirst({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    
    // Check if activity is used in any timesheet entries
    const usageCount = await prisma.timesheet.count({
      where: { activityId: parseInt(id) }
    });
    
    if (usageCount > 0) {
      // Soft delete - just mark as inactive
      const activity = await prisma.activityMaster.update({
        where: { id: parseInt(id) },
        data: { isActive: false, updatedAt: new Date() }
      });
      await logDatabaseOperation('SOFT_DELETE', 'activityMaster', activity.id, req.user.id);
      return res.json({ 
        success: true, 
        data: activity, 
        message: `Activity deactivated (used in ${usageCount} timesheet entries). It will no longer appear in the activity dropdown.` 
      });
    }
    
    // Hard delete if not used
    await prisma.activityMaster.delete({ where: { id: parseInt(id) } });
    await logDatabaseOperation('DELETE', 'activityMaster', parseInt(id), req.user.id);
    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    console.error("❌ DELETE ACTIVITY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete activity", error: error.message });
  }
};

// ===================== BULK CREATE TIMESHEET =====================

// POST /api/timesheet/bulk-create - Create multiple timesheet entries at once
const bulkCreateTimesheet = async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'Entries array is required' });
    }
    
    // Validate total hours across all entries for each date
    const hoursByDate = {};
    for (const entry of entries) {
      if (!entry.date || !entry.hours || entry.hours <= 0) {
        return res.status(400).json({ success: false, message: 'Each entry must have a valid date and hours > 0' });
      }
      if (entry.hours > 24) {
        return res.status(400).json({ success: false, message: 'Hours cannot exceed 24 per entry' });
      }
      const key = entry.date;
      hoursByDate[key] = (hoursByDate[key] || 0) + entry.hours;
      if (hoursByDate[key] > 24) {
        return res.status(400).json({ success: false, message: `Total hours for ${key} exceed 24` });
      }
      // Validate date is not in the future
      const entryDate = new Date(entry.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      entryDate.setHours(0, 0, 0, 0);
      if (entryDate > today) {
        return res.status(400).json({ success: false, message: `Date ${entry.date} cannot be in the future` });
      }
    }
    
    const results = [];
    for (const entry of entries) {
      try {
        // Check if entry already exists for this date + activity combination
        const existingWhere = {
          employeeId: req.user.id,
          date: new Date(entry.date),
          organizationId: req.user.organizationId
        };
        if (entry.activityId) {
          existingWhere.activityId = entry.activityId;
        }
        
        const existingEntry = await prisma.timesheet.findFirst({
          where: existingWhere
        });
        
        let timesheet;
        if (existingEntry) {
          // Update existing entry
          timesheet = await prisma.timesheet.update({
            where: { id: existingEntry.id },
            data: {
              hours: parseFloat(entry.hours),
              description: entry.description || null,
              activityId: entry.activityId || null,
              updatedAt: new Date()
            },
            include: {
              employee: { select: { id: true, name: true, email: true } },
              ActivityMaster: { select: { id: true, name: true } }
            }
          });
        } else {
          // Create new entry
          timesheet = await prisma.timesheet.create({
            data: {
              employeeId: req.user.id,
              date: new Date(entry.date),
              hours: parseFloat(entry.hours),
              description: entry.description || null,
              activityId: entry.activityId || null,
              organizationId: req.user.organizationId
            },
            include: {
              employee: { select: { id: true, name: true, email: true } },
              ActivityMaster: { select: { id: true, name: true } }
            }
          });
        }
        
        await logDatabaseOperation('CREATE', 'timesheet', timesheet.id, req.user.id);
        results.push({ success: true, data: timesheet });
      } catch (error) {
        results.push({ success: false, error: error.message, date: entry.date });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `Successfully created/updated ${successCount} timesheet entries${failureCount > 0 ? ` (${failureCount} failed)` : ''}`,
      results,
      summary: { total: entries.length, successful: successCount, failed: failureCount }
    });
  } catch (error) {
    console.error("❌ BULK CREATE TIMESHEET ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to bulk create timesheet entries", error: error.message });
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
  bulkApproveTimesheets,
  bulkCreateTimesheet,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
};
