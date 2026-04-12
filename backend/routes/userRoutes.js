import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  resetUserPassword, 
  deleteUser, 
  createNewUser 
} from '../controllers/userController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 USER ROUTE:", req.method, req.url);
  next();
});

// GET /api/users - Get all users (admin only)
router.get('/', requireAuth, authorize('admin'), getAllUsers);

// GET /api/users/:id - Get specific user (admin only)
router.get('/:id', requireAuth, authorize('admin'), getUserById);

// POST /api/users - Create new user (admin only)
router.post('/', requireAuth, authorize('admin'), createNewUser);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', requireAuth, authorize('admin'), updateUser);

// PUT /api/users/:id/password - Reset user password (admin only)
router.put('/:id/password', requireAuth, authorize('admin'), resetUserPassword);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAuth, authorize('admin'), deleteUser);

export default router;
