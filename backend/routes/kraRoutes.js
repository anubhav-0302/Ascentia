import express from 'express';
import { 
  getKRAsByGoal, 
  createKRA, 
  updateKRA, 
  deleteKRA 
} from '../kraController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 KRA ROUTE:", req.method, req.url);
  next();
});

// KRA Routes - Admin/Manager can manage, employees view own
router.get('/goal/:goalId', requireAuth, getKRAsByGoal);
router.post('/', requireAuth, authorize('admin', 'manager', 'teamlead'), createKRA);
router.put('/:id', requireAuth, authorize('admin', 'manager', 'teamlead'), updateKRA);
router.delete('/:id', requireAuth, authorize('admin', 'manager', 'teamlead'), deleteKRA);

export default router;
