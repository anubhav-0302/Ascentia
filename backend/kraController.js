import prisma from './lib/prisma.js';
import { logDatabaseOperation } from './databaseLogger.js';
import { tenantWhere, tenantWhereWith } from './helpers/tenantHelper.js';

// GET /api/kras/goal/:goalId - Get all KRAs for a goal
const getKRAsByGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const gId = parseInt(goalId);
    
    if (isNaN(gId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid goal ID' 
      });
    }
    
    const kras = await prisma.kRA.findMany({
      where: { 
        goalId: gId
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // console.log(`📊 getKRAsByGoal: ${kras.length} KRAs for goal ${gId}`);
    res.json({ success: true, data: kras });
  } catch (error) {
    console.error("❌ GET KRAs ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch KRAs", 
      error: error.message 
    });
  }
};

// POST /api/kras - Create new KRA
const createKRA = async (req, res) => {
  try {
    const { goalId, title, description, targetValue, weightage, dueDate } = req.body;
    
    if (!goalId || !title) {
      return res.status(400).json({ 
        success: false, 
        message: 'Goal ID and title are required' 
      });
    }
    
    // Verify goal exists
    const goal = await prisma.performanceGoal.findFirst({
      where: { 
        id: parseInt(goalId)
      }
    });
    
    if (!goal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Performance goal not found' 
      });
    }
    
    const kra = await prisma.kRA.create({
      data: {
        goalId: parseInt(goalId),
        title,
        description: description || null,
        targetValue: targetValue || null,
        weightage: weightage ? parseFloat(weightage) : 1.0,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });
    
    await logDatabaseOperation('CREATE', 'kra', kra.id, req.user.id);
    
    // console.log(`✅ Created KRA: ${kra.id}`);
    res.json({ success: true, data: kra });
  } catch (error) {
    console.error("❌ CREATE KRA ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create KRA", 
      error: error.message 
    });
  }
};

// PUT /api/kras/:id - Update KRA
const updateKRA = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetValue, actualValue, weightage, status, dueDate, completedDate } = req.body;
    const kraId = parseInt(id);
    
    if (isNaN(kraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid KRA ID' 
      });
    }
    
    // Check if KRA exists
    const existingKRA = await prisma.kRA.findFirst({
      where: { 
        id: kraId
      }
    });
    
    if (!existingKRA) {
      return res.status(404).json({ 
        success: false, 
        message: 'KRA not found' 
      });
    }
    
    const kra = await prisma.kRA.update({
      where: { id: kraId },
      data: {
        title: title || existingKRA.title,
        description: description !== undefined ? description : existingKRA.description,
        targetValue: targetValue !== undefined ? targetValue : existingKRA.targetValue,
        actualValue: actualValue !== undefined ? actualValue : existingKRA.actualValue,
        weightage: weightage ? parseFloat(weightage) : existingKRA.weightage,
        status: status || existingKRA.status,
        dueDate: dueDate ? new Date(dueDate) : existingKRA.dueDate,
        completedDate: completedDate ? new Date(completedDate) : existingKRA.completedDate
      }
    });
    
    await logDatabaseOperation('UPDATE', 'kra', kra.id, req.user.id);
    
    // console.log(`✅ Updated KRA: ${kra.id}`);
    res.json({ success: true, data: kra });
  } catch (error) {
    console.error("❌ UPDATE KRA ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update KRA", 
      error: error.message 
    });
  }
};

// DELETE /api/kras/:id - Delete KRA
const deleteKRA = async (req, res) => {
  try {
    const { id } = req.params;
    const kraId = parseInt(id);
    
    if (isNaN(kraId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid KRA ID' 
      });
    }
    
    // Check if KRA exists
    const kra = await prisma.kRA.findFirst({
      where: { 
        id: kraId
      }
    });
    
    if (!kra) {
      return res.status(404).json({ 
        success: false, 
        message: 'KRA not found' 
      });
    }
    
    await prisma.kRA.delete({
      where: { id: kraId }
    });
    
    await logDatabaseOperation('DELETE', 'kra', kraId, req.user.id);
    
    // console.log(`✅ Deleted KRA: ${kraId}`);
    res.json({ success: true, message: 'KRA deleted successfully' });
  } catch (error) {
    console.error("❌ DELETE KRA ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete KRA", 
      error: error.message 
    });
  }
};

export {
  getKRAsByGoal,
  createKRA,
  updateKRA,
  deleteKRA
};
