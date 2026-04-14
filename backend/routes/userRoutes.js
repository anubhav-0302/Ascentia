import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  resetUserPassword, 
  deleteUser, 
  createNewUser,
  changePassword,
  updateProfile,
  setupTwoFactor,
  disableTwoFactor,
  uploadProfilePicture 
} from '../controllers/userController.js';
import { requireAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
    }
  }
});

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 USER ROUTE:", req.method, req.url);
  next();
});

// PUT /api/users/me/password - Change own password (authenticated user)
router.put('/me/password', requireAuth, changePassword);

// PUT /api/users/me - Update own profile (authenticated user)
router.put('/me', requireAuth, updateProfile);

// POST /api/users/me/2fa/setup - Setup 2FA (authenticated user)
router.post('/me/2fa/setup', requireAuth, setupTwoFactor);

// POST /api/users/me/2fa/disable - Disable 2FA (authenticated user)
router.post('/me/2fa/disable', requireAuth, disableTwoFactor);

// POST /api/users/me/profile-picture - Upload profile picture (authenticated user)
router.post('/me/profile-picture', requireAuth, upload.single('profilePicture'), uploadProfilePicture);

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
