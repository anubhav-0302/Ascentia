import prisma from './lib/prisma.js';
import { logDatabaseOperation } from './databaseLogger.js';

// GET /api/performance/cycles - Get all performance cycles
const getPerformanceCycles = async (req, res) => {
  try {
    const cycles = await prisma.performanceCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        goals: {
          select: { id: true }
        },
        reviews: {
          select: { id: true }
        }
      }
    });
    
    console.log(`📊 getPerformanceCycles: ${cycles.length} cycles`);
    res.json({ success: true, data: cycles });
  } catch (error) {
    console.error("❌ GET PERFORMANCE CYCLES ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch performance cycles", 
      error: error.message 
    });
  }
};

// POST /api/performance/cycles - Create new performance cycle
const createPerformanceCycle = async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    
    if (!name || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, start date, and end date are required' 
      });
    }
    
    const cycle = await prisma.performanceCycle.create({
      data: {
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
    
    await logDatabaseOperation('CREATE', 'performance_cycle', cycle.id, req.user.id);
    
    console.log(`✅ Created performance cycle: ${cycle.id}`);
    res.json({ success: true, data: cycle });
  } catch (error) {
    console.error("❌ CREATE PERFORMANCE CYCLE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create performance cycle", 
      error: error.message 
    });
  }
};

// GET /api/performance/goals - Get performance goals
const getPerformanceGoals = async (req, res) => {
  try {
    const { cycleId, employeeId, status } = req.query;
    
    const whereClause = {};
    
    if (cycleId) {
      whereClause.cycleId = parseInt(cycleId);
    }
    
    if (employeeId) {
      whereClause.employeeId = parseInt(employeeId);
    } else if (!req.user.role || req.user.role === 'employee') {
      // Employees can only see their own goals
      whereClause.employeeId = req.user.id;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const goals = await prisma.performanceGoal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        cycle: {
          select: { id: true, name: true, startDate: true, endDate: true }
        },
        employee: {
          select: { id: true, name: true, email: true, department: true }
        },
        reviews: {
          select: { id: true, type: true, rating: true, status: true }
        }
      }
    });
    
    console.log(`📊 getPerformanceGoals: ${goals.length} goals`);
    res.json({ success: true, data: goals });
  } catch (error) {
    console.error("❌ GET PERFORMANCE GOALS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch performance goals", 
      error: error.message 
    });
  }
};

// POST /api/performance/goals - Create new performance goal
const createPerformanceGoal = async (req, res) => {
  try {
    const { cycleId, employeeId, title, description, targetDate } = req.body;
    
    if (!cycleId || !employeeId || !title || !targetDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cycle ID, employee ID, title, and target date are required' 
      });
    }
    
    // Verify cycle exists
    const cycle = await prisma.performanceCycle.findFirst({
      where: { id: parseInt(cycleId) }
    });
    
    if (!cycle) {
      return res.status(404).json({ 
        success: false, 
        message: 'Performance cycle not found' 
      });
    }
    
    const goal = await prisma.performanceGoal.create({
      data: {
        cycleId: parseInt(cycleId),
        employeeId: parseInt(employeeId),
        title,
        description: description || null,
        targetDate: new Date(targetDate)
      },
      include: {
        cycle: {
          select: { id: true, name: true }
        },
        employee: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logDatabaseOperation('CREATE', 'performance_goal', goal.id, req.user.id);
    
    console.log(`✅ Created performance goal: ${goal.id}`);
    res.json({ success: true, data: goal });
  } catch (error) {
    console.error("❌ CREATE PERFORMANCE GOAL ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create performance goal", 
      error: error.message 
    });
  }
};

// PUT /api/performance/goals/:id - Update performance goal
const updatePerformanceGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, status } = req.body;
    
    const existingGoal = await prisma.performanceGoal.findFirst({
      where: { id: parseInt(id) }
    });
    
    if (!existingGoal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Performance goal not found' 
      });
    }
    
    // Only allow update if user owns the goal, is admin, or is manager
    if (existingGoal.employeeId !== req.user.id && 
        !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this goal' 
      });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
    if (status !== undefined) updateData.status = status;
    
    const goal = await prisma.performanceGoal.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        cycle: {
          select: { id: true, name: true }
        },
        employee: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logDatabaseOperation('UPDATE', 'performance_goal', goal.id, req.user.id);
    
    console.log(`✅ Updated performance goal: ${goal.id}`);
    res.json({ success: true, data: goal });
  } catch (error) {
    console.error("❌ UPDATE PERFORMANCE GOAL ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update performance goal", 
      error: error.message 
    });
  }
};

// GET /api/performance/reviews - Get performance reviews
const getPerformanceReviews = async (req, res) => {
  try {
    const { cycleId, goalId, employeeId, reviewerId, type, status } = req.query;
    
    const whereClause = {};
    
    if (cycleId) whereClause.cycleId = parseInt(cycleId);
    if (goalId) whereClause.goalId = parseInt(goalId);
    if (employeeId) whereClause.employeeId = parseInt(employeeId);
    if (reviewerId) whereClause.reviewerId = parseInt(reviewerId);
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    
    // Employees can only see their own reviews and reviews they wrote
    if (!['admin', 'manager'].includes(req.user.role)) {
      whereClause.OR = [
        { employeeId: req.user.id },
        { reviewerId: req.user.id }
      ];
    }
    
    const reviews = await prisma.performanceReview.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        cycle: {
          select: { id: true, name: true }
        },
        goal: {
          select: { id: true, title: true }
        },
        employee: {
          select: { id: true, name: true, email: true, department: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log(`📊 getPerformanceReviews: ${reviews.length} reviews`);
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("❌ GET PERFORMANCE REVIEWS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch performance reviews", 
      error: error.message 
    });
  }
};

// POST /api/performance/reviews - Create new performance review
const createPerformanceReview = async (req, res) => {
  try {
    const { cycleId, goalId, employeeId, type, rating, comments } = req.body;
    
    if (!cycleId || !goalId || !employeeId || !type || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cycle ID, goal ID, employee ID, type, and rating are required' 
      });
    }
    
    if (!['Self', 'Manager'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either "Self" or "Manager"' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5' 
      });
    }
    
    // Check if review already exists
    const existingReview = await prisma.performanceReview.findFirst({
      where: {
        goalId: parseInt(goalId),
        reviewerId: req.user.id,
        type
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: `${type} review already exists for this goal` 
      });
    }
    
    const review = await prisma.performanceReview.create({
      data: {
        cycleId: parseInt(cycleId),
        goalId: parseInt(goalId),
        employeeId: parseInt(employeeId),
        reviewerId: req.user.id,
        type,
        rating: parseInt(rating),
        comments: comments || null
      },
      include: {
        cycle: {
          select: { id: true, name: true }
        },
        goal: {
          select: { id: true, title: true }
        },
        employee: {
          select: { id: true, name: true, email: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logDatabaseOperation('CREATE', 'performance_review', review.id, req.user.id);
    
    console.log(`✅ Created performance review: ${review.id}`);
    res.json({ success: true, data: review });
  } catch (error) {
    console.error("❌ CREATE PERFORMANCE REVIEW ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create performance review", 
      error: error.message 
    });
  }
};

// PUT /api/performance/reviews/:id - Update performance review
const updatePerformanceReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments, status } = req.body;
    
    const existingReview = await prisma.performanceReview.findFirst({
      where: { id: parseInt(id) }
    });
    
    if (!existingReview) {
      return res.status(404).json({ 
        success: false, 
        message: 'Performance review not found' 
      });
    }
    
    // Only allow update if user wrote the review or is admin
    if (existingReview.reviewerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }
    
    const updateData = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Rating must be between 1 and 5' 
        });
      }
      updateData.rating = parseInt(rating);
    }
    if (comments !== undefined) updateData.comments = comments;
    if (status !== undefined) updateData.status = status;
    
    const review = await prisma.performanceReview.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        cycle: {
          select: { id: true, name: true }
        },
        goal: {
          select: { id: true, title: true }
        },
        employee: {
          select: { id: true, name: true, email: true }
        },
        reviewer: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    await logDatabaseOperation('UPDATE', 'performance_review', review.id, req.user.id);
    
    console.log(`✅ Updated performance review: ${review.id}`);
    res.json({ success: true, data: review });
  } catch (error) {
    console.error("❌ UPDATE PERFORMANCE REVIEW ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update performance review", 
      error: error.message 
    });
  }
};

export {
  getPerformanceCycles,
  createPerformanceCycle,
  getPerformanceGoals,
  createPerformanceGoal,
  updatePerformanceGoal,
  getPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview
};
