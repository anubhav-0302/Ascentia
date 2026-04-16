import express from 'express';
import {
  getUserSettings,
  updateUserSettings,
  changePassword,
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  deleteAccount,
  exportUserData
} from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Debug logging
router.use((req, res, next) => {
  console.log("🔍 SETTINGS ROUTE:", req.method, req.url);
  next();
});

// Settings CRUD - Authenticated users only
router.get('/', requireAuth, getUserSettings);
router.put('/', requireAuth, updateUserSettings);

// Password management - Authenticated users only
router.post('/change-password', requireAuth, changePassword);

// 2FA management - Authenticated users only
router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/verify', requireAuth, verifyAndEnable2FA);
router.delete('/2fa', requireAuth, disable2FA);

// Account management - Authenticated users only
router.delete('/account', requireAuth, deleteAccount);
router.get('/export', requireAuth, exportUserData);

export default router;
