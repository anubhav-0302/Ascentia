import express from 'express';
import { register, login, getCurrentUser, forgotPassword, verifyPassword } from '../simpleAuthController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 AUTH ROUTE:", req.method, req.url);
  next();
});

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes (authentication required)
router.get('/me', requireAuth, getCurrentUser);
router.post('/verify-password', requireAuth, verifyPassword);

export default router;
