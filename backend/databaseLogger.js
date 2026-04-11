// Database logging system for tracking all CRUD operations
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'database-logs.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read existing logs
const readLogs = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database logs:', error);
    return [];
  }
};

// Write logs to file
const writeLogs = (logs) => {
  try {
    ensureDataDir();
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database logs:', error);
    return false;
  }
};

// Log database operation
export const logDatabaseOperation = (operation, entity, details, userId = null) => {
  try {
    const logs = readLogs();
    
    const logEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      operation, // 'CREATE', 'UPDATE', 'DELETE', 'READ'
      entity,    // 'leave_request', 'notification', 'user', 'employee'
      details,
      userId,    // User who performed the operation
      ipAddress: null, // Could be added from request if needed
      userAgent: null  // Could be added from request if needed
    };
    
    logs.push(logEntry);
    writeLogs(logs);
    
    console.log(`📝 DB LOG: ${operation} ${entity}`, {
      id: logEntry.id,
      userId,
      details
    });
    
    return logEntry;
  } catch (error) {
    console.error('❌ Error logging database operation:', error);
    return null;
  }
};

// Get logs for specific entity
export const getEntityLogs = (entity, limit = 50) => {
  try {
    const logs = readLogs();
    const entityLogs = logs
      .filter(log => log.entity === entity)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return entityLogs;
  } catch (error) {
    console.error('❌ Error getting entity logs:', error);
    return [];
  }
};

// Get logs for specific user
export const getUserLogs = (userId, limit = 50) => {
  try {
    const logs = readLogs();
    const userLogs = logs
      .filter(log => log.userId === parseInt(userId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    return userLogs;
  } catch (error) {
    console.error('❌ Error getting user logs:', error);
    return [];
  }
};

// Get all logs with pagination
export const getAllLogs = (page = 1, limit = 100) => {
  try {
    const logs = readLogs();
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLogs = sortedLogs.slice(startIndex, endIndex);
    
    return {
      logs: paginatedLogs,
      total: logs.length,
      page,
      totalPages: Math.ceil(logs.length / limit)
    };
  } catch (error) {
    console.error('❌ Error getting all logs:', error);
    return { logs: [], total: 0, page: 1, totalPages: 0 };
  }
};

// Clear old logs (keep only last N days)
export const clearOldLogs = (daysToKeep = 30) => {
  try {
    const logs = readLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    writeLogs(filteredLogs);
    
    const removedCount = logs.length - filteredLogs.length;
    console.log(`🗑️ Cleared ${removedCount} old log entries (kept last ${daysToKeep} days)`);
    
    return removedCount;
  } catch (error) {
    console.error('❌ Error clearing old logs:', error);
    return 0;
  }
};

// Export log statistics
export const getLogStatistics = () => {
  try {
    const logs = readLogs();
    
    const stats = {
      totalLogs: logs.length,
      operations: {},
      entities: {},
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    };
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    logs.forEach(log => {
      // Count operations
      stats.operations[log.operation] = (stats.operations[log.operation] || 0) + 1;
      
      // Count entities
      stats.entities[log.entity] = (stats.entities[log.entity] || 0) + 1;
      
      // Count by time period
      const logDate = new Date(log.timestamp);
      if (logDate > last24Hours) stats.last24Hours++;
      if (logDate > last7Days) stats.last7Days++;
      if (logDate > last30Days) stats.last30Days++;
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting log statistics:', error);
    return null;
  }
};
