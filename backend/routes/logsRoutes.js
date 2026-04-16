import express from 'express';
import { getAllLogs } from '../databaseLogger.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 LOGS ROUTE:", req.method, req.url);
  next();
});

// Get all audit logs with pagination (admin only)
router.get('/', requireAuth, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const operation = req.query.operation;
    const entity = req.query.entity;
    const userId = req.query.userId;

    // Get ALL logs first, then filter and paginate
    const result = await getAllLogs(1, 100000);
    const allLogs = result.logs;

    // Normalize and enrich logs with user information and filter out non-existent users
    const enrichedLogs = [];
    
    for (const log of allLogs) {
      let userName = 'System';
      let userExists = false;
      
      if (log.userId) {
        try {
          // Import prisma dynamically to avoid circular dependencies
          const { default: prisma } = await import('../lib/prisma.js');
          const user = await prisma.employee.findUnique({
            where: { id: log.userId },
            select: { name: true, email: true }
          });
          if (user) {
            userName = user.name;
            userExists = true;
          }
        } catch (error) {
          console.error('Error fetching user for log:', error);
        }
      } else {
        // If no userId, include the log (system operations)
        userExists = true;
      }
      
      // Only include logs from existing users or system operations
      if (userExists) {
        // Handle both string and object operation formats
        let normalizedLog = { ...log };
        
        // If operation is an object, extract the values
        if (typeof log.operation === 'object' && log.operation !== null) {
          normalizedLog = {
            ...log,
            operation: log.operation.operation || 'UNKNOWN',
            entity: log.operation.entityType || log.entity || 'unknown',
            details: log.operation.details || log.details
          };
        }
        
        enrichedLogs.push({
          ...normalizedLog,
          userName
        });
      }
    }

    // Apply filters on normalized enriched logs
    let filteredEnrichedLogs = enrichedLogs;

    if (operation) {
      filteredEnrichedLogs = filteredEnrichedLogs.filter(log => log.operation === operation);
    }
    if (entity) {
      filteredEnrichedLogs = filteredEnrichedLogs.filter(log => log.entity === entity);
    }
    if (userId) {
      filteredEnrichedLogs = filteredEnrichedLogs.filter(log => log.userId === parseInt(userId));
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = filteredEnrichedLogs.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredEnrichedLogs.length;
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: filteredEnrichedLogs.length,
        page,
        totalPages: Math.ceil(filteredEnrichedLogs.length / limit),
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
});

// Get log statistics (admin only)
router.get('/statistics', requireAuth, authorize('admin'), async (req, res) => {
  try {
    // Get all logs first
    const allLogsResult = await getAllLogs(1, 10000); // Get all logs with high limit
    
    // Apply the same filtering logic as the logs endpoint
    const enrichedLogs = [];
    
    for (const log of allLogsResult.logs) {
      let userExists = false;
      
      if (log.userId) {
        try {
          // Import prisma dynamically to avoid circular dependencies
          const { default: prisma } = await import('../lib/prisma.js');
          const user = await prisma.employee.findUnique({
            where: { id: log.userId },
            select: { name: true, email: true }
          });
          if (user) {
            userExists = true;
          }
        } catch (error) {
          console.error('Error fetching user for statistics:', error);
        }
      } else {
        // If no userId, include the log (system operations)
        userExists = true;
      }
      
      // Only include logs from existing users or system operations
      if (userExists) {
        enrichedLogs.push(log);
      }
    }
    
    // Calculate statistics from filtered logs
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const last24HoursCount = enrichedLogs.filter(log => new Date(log.timestamp) >= last24Hours).length;
    const last7DaysCount = enrichedLogs.filter(log => new Date(log.timestamp) >= last7Days).length;
    const last30DaysCount = enrichedLogs.filter(log => new Date(log.timestamp) >= last30Days).length;
    
    // Count operations and entities
    const operations = {};
    const entities = {};
    
    enrichedLogs.forEach(log => {
      // Handle both string and object operation formats
      let operation = log.operation;
      if (typeof operation === 'object' && operation !== null) {
        operation = operation.operation || 'UNKNOWN';
      }
      
      let entity = log.entity;
      if (typeof log.operation === 'object' && log.operation !== null) {
        entity = log.operation.entityType || log.entity || 'unknown';
      }
      
      operations[operation] = (operations[operation] || 0) + 1;
      entities[entity] = (entities[entity] || 0) + 1;
    });
    
    const stats = {
      totalLogs: enrichedLogs.length,
      last24Hours: last24HoursCount,
      last7Days: last7DaysCount,
      last30Days: last30DaysCount,
      operations,
      entities
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching log statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch log statistics'
    });
  }
});

export default router;
