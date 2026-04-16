import express from 'express';
import { 
  getKRAsByGoal, 
  createKRA, 
  updateKRA, 
  deleteKRA 
} from '../kraController.js';

const router = express.Router();

// KRA Routes
router.get('/goal/:goalId', getKRAsByGoal);
router.post('/', createKRA);
router.put('/:id', updateKRA);
router.delete('/:id', deleteKRA);

export default router;
