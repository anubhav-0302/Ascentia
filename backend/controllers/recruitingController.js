import prisma from '../lib/prisma.js';
import { tenantWhere } from '../helpers/tenantHelper.js';

// Get all job positions
export const getJobPositions = async (req, res) => {
  try {
    const positions = await prisma.jobPosition.findMany({
      where: tenantWhere(req),
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { candidates: true }
        }
      },
      orderBy: { postedAt: 'desc' }
    });

    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    console.error('Error fetching job positions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job positions',
      error: error.message
    });
  }
};

// Get all candidates
export const getCandidates = async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        position: {
          organizationId: req.user.organizationId || 1
        }
      },
      include: {
        position: {
          select: { id: true, title: true, department: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: error.message
    });
  }
};

// Get recruiting metrics
export const getRecruitingMetrics = async (req, res) => {
  try {
    const metrics = await prisma.jobPosition.groupBy({
      by: ['status'],
      where: tenantWhere(req),
      _count: true
    });

    const candidatesByStage = await prisma.candidate.groupBy({
      by: ['stage'],
      where: {
        position: {
          organizationId: req.user.organizationId || 1
        }
      },
      _count: true
    });

    res.json({
      success: true,
      data: {
        positionsByStatus: metrics,
        candidatesByStage
      }
    });
  } catch (error) {
    console.error('Error fetching recruiting metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recruiting metrics',
      error: error.message
    });
  }
};
