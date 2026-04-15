import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Get user settings
export const getUserSettings = async (req, res) => {
  try {
    console.log('Fetching settings for user:', req.user);
    const userId = req.user.id;
    
    const user = await prisma.employee.findUnique({
      where: { id: userId },
      select: { settings: true }
    });

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('User found, settings:', user.settings);

    // Return default settings if none exist
    const defaultSettings = {
      language: 'English (US)',
      timezone: 'UTC-5 (Eastern)',
      dateFormat: 'MM/DD/YYYY',
      darkMode: true,
      compactView: false,
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: false,
      projectUpdates: true,
      systemAlerts: true,
      profileVisibility: 'public',
      shareAnalytics: true,
      marketingEmails: false
    };

    const settings = user.settings || defaultSettings;

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// Update user settings
export const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;

    const user = await prisma.employee.update({
      where: { id: userId },
      data: { settings },
      select: { settings: true }
    });

    res.json({ success: true, data: user.settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.employee.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.employee.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        needsPasswordChange: false
      }
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
};

// Setup 2FA
export const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.employee.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Ascentia HRMS (${user.email})`,
      issuer: 'Ascentia HRMS'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret to user (but don't enable 2FA yet)
    await prisma.employee.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 }
    });

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ success: false, message: 'Failed to setup 2FA' });
  }
};

// Verify and enable 2FA
export const verifyAndEnable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    const user = await prisma.employee.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true }
    });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA setup not initiated' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    // Enable 2FA
    await prisma.employee.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ success: false, message: 'Failed to verify 2FA' });
  }
};

// Disable 2FA
export const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.employee.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ success: false, message: 'Failed to disable 2FA' });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password
    const user = await prisma.employee.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Delete user (cascade delete will handle related records)
    await prisma.employee.delete({
      where: { id: userId }
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};

// Export user data
export const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.employee.findUnique({
      where: { id: userId },
      include: {
        leaveRequests: true,
        timesheets: true,
        goals: true,
        salaries: {
          orderBy: { effectiveDate: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove sensitive data
    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        department: user.department,
        location: user.location,
        role: user.role,
        createdAt: user.createdAt
      },
      settings: user.settings,
      leaveRequests: user.leaveRequests.map(lr => ({
        type: lr.type,
        startDate: lr.startDate,
        endDate: lr.endDate,
        status: lr.status,
        createdAt: lr.createdAt
      })),
      timesheets: user.timesheets.map(ts => ({
        weekStartDate: ts.weekStartDate,
        totalHours: ts.totalHours,
        status: ts.status,
        createdAt: ts.createdAt
      })),
      goals: user.goals.map(g => ({
        title: g.title,
        description: g.description,
        status: g.status,
        createdAt: g.createdAt
      })),
      currentSalary: user.salaries[0] ? {
        amount: user.salaries[0].amount,
        effectiveDate: user.salaries[0].effectiveDate
      } : null,
      exportDate: new Date().toISOString()
    };

    res.json({ success: true, data: exportData });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
};
