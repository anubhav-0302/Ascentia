import prisma from '../lib/prisma.js';
import { tenantWhere } from '../helpers/tenantHelper.js';

// Get all workflows
export const getWorkflows = async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      where: tenantWhere(req),
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { executions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workflows',
      error: error.message
    });
  }
};

// Create workflow
export const createWorkflow = async (req, res) => {
  try {
    const { name, description, category, trigger } = req.body;
    
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        category,
        trigger,
        status: 'draft',
        createdBy: req.user.id,
        organizationId: req.user.organizationId || 1
      }
    });

    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: workflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create workflow',
      error: error.message
    });
  }
};
