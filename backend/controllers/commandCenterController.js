import prisma from '../lib/prisma.js';
import { tenantWhere } from '../helpers/tenantHelper.js';

// Get system metrics
export const getSystemMetrics = async (req, res) => {
  try {
    const metrics = await prisma.systemMetric.findMany({
      where: tenantWhere(req),
      orderBy: { recordedAt: 'desc' },
      take: 50
    });

    // Group by metric type and get latest values
    const latestMetrics = metrics.reduce((acc, metric) => {
      if (!acc[metric.metricType] || metric.recordedAt > acc[metric.metricType].recordedAt) {
        acc[metric.metricType] = metric;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(latestMetrics)
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics',
      error: error.message
    });
  }
};

// Get integrations
export const getIntegrations = async (req, res) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: tenantWhere(req),
      orderBy: { configuredAt: 'desc' }
    });

    res.json({
      success: true,
      data: integrations
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch integrations',
      error: error.message
    });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    // Get recent workflow executions
    const workflowExecutions = await prisma.workflowExecution.findMany({
      where: {
        workflow: {
          organizationId: req.user.organizationId || 1
        }
      },
      include: {
        workflow: {
          select: { name: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    // Transform into activity format
    const activities = workflowExecutions.map(execution => ({
      id: execution.id,
      type: 'workflow',
      title: `Workflow: ${execution.workflow.name}`,
      description: `Status: ${execution.status}`,
      priority: execution.status === 'failed' ? 'high' : 'low',
      time: execution.startedAt.toLocaleString()
    }));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};
