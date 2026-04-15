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

const router = express.Router();

// Settings CRUD
router.get('/', getUserSettings);
router.put('/', updateUserSettings);

// Password management
router.post('/change-password', changePassword);

// 2FA management
router.post('/2fa/setup', setup2FA);
router.post('/2fa/verify', verifyAndEnable2FA);
router.delete('/2fa', disable2FA);

// Account management
router.delete('/account', deleteAccount);
router.get('/export', exportUserData);

export default router;
