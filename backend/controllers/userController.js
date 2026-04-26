import prisma from '../lib/prisma.js';
import { logDatabaseOperation } from '../databaseLogger.js';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });
    // console.log(`📊 getAllUsers: returned ${users.length} users from database`);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("❌ GET ALL USERS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users", error: error.message });
  }
};

// GET /api/users/:id - Get specific user (admin only)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("❌ GET USER BY ID ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user", error: error.message });
  }
};

// PUT /api/users/:id - Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    const adminUserId = req.user.id;

    const existing = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    if (parseInt(id) === adminUserId && role && role !== existing.role)
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });

    const validRoles = ['admin', 'employee'];
    if (role && !validRoles.includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin or employee' });

    const updated = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(status && { status })
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
    });

    await logDatabaseOperation({ operation: 'UPDATE', entityType: 'user', entityId: updated.id, userId: adminUserId, details: { name, email, role, status } });
    // console.log("✅ User updated in database:", updated.id);
    res.json({ success: true, message: 'User updated successfully', data: updated });
  } catch (error) {
    console.error("❌ UPDATE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update user", error: error.message });
  }
};

// PUT /api/users/:id/password - Reset user password (admin only)
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const adminUserId = req.user.id;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });

    const existing = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });

    await logDatabaseOperation({ operation: 'UPDATE', entityType: 'user', entityId: parseInt(id), userId: adminUserId, details: { action: 'password_reset' } });
    // console.log("✅ User password reset in database:", id);
    res.json({ success: true, message: 'Password reset successfully', data: { id: parseInt(id), email: existing.email } });
  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
  }
};

// PUT /api/users/:id/password - Change own password (authenticated user)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get current user
    const user = await prisma.employee.findUnique({ 
      where: { id: parseInt(userId) } 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Start a transaction to update password and track history
    await prisma.$transaction(async (tx) => {
      // Update employee password
      await tx.employee.update({
        where: { id: parseInt(userId) },
        data: { 
          password: hashedNewPassword,
          needsPasswordChange: false
        }
      });

      // Track password change history
      await tx.passwordChangeHistory.create({
        data: {
          employeeId: parseInt(userId),
          changedBy: parseInt(userId), // Self-change
          reason: 'User changed their own password'
        }
      });
    });

    await logDatabaseOperation({ 
      operation: 'UPDATE', 
      entityType: 'user', 
      entityId: parseInt(userId), 
      userId: parseInt(userId), 
      details: { action: 'password_change' } 
    });

    // console.log("✅ User password changed in database:", userId);
    res.json({ 
      success: true, 
      message: 'Password changed successfully', 
      data: { id: parseInt(userId) } 
    });
  } catch (error) {
    console.error("❌ CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to change password", 
      error: error.message 
    });
  }
};

// DELETE /api/users/:id - Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    if (parseInt(id) === adminUserId)
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });

    const existing = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.employee.delete({ where: { id: parseInt(id) } });
    await logDatabaseOperation({ operation: 'DELETE', entityType: 'user', entityId: parseInt(id), userId: adminUserId, details: { email: existing.email } });
    // console.log("✅ User deleted from database:", id);
    res.json({ success: true, message: 'User deleted successfully', data: { id: parseInt(id), email: existing.email } });
  } catch (error) {
    console.error("❌ DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
};

// PUT /api/users/me - Update own profile (authenticated user)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.employee.findFirst({
      where: { 
        email: email,
        NOT: { id: parseInt(userId) }
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already taken by another user' 
      });
    }

    // Update user profile
    const updatedUser = await prisma.employee.update({
      where: { id: parseInt(userId) },
      data: { 
        name,
        email,
        phone: phone || null,
        address: address || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePicture: true
      }
    });

    await logDatabaseOperation({ 
      operation: 'UPDATE', 
      entityType: 'user', 
      entityId: parseInt(userId), 
      userId: parseInt(userId), 
      details: { action: 'profile_update', fields: { name, email, phone, address } } 
    });

    // console.log("✅ Profile updated:", userId);
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: updatedUser 
    });
  } catch (error) {
    console.error("❌ UPDATE PROFILE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile", 
      error: error.message 
    });
  }
};

// POST /api/users/me/2fa/setup - Setup 2FA
export const setupTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generate a secret key (in production, use a proper TOTP library)
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Update user with 2FA secret
    await prisma.employee.update({
      where: { id: parseInt(userId) },
      data: { 
        twoFactorSecret: secret,
        twoFactorEnabled: true
      }
    });

    await logDatabaseOperation({ 
      operation: 'UPDATE', 
      entityType: 'user', 
      entityId: parseInt(userId), 
      userId: parseInt(userId), 
      details: { action: '2fa_setup' } 
    });

    // console.log("✅ 2FA setup completed:", userId);
    res.json({ 
      success: true, 
      message: 'Two-factor authentication enabled successfully', 
      data: { 
        secret: secret,
        qrCode: `otpauth://totp/Ascentia:${req.user.email}?secret=${secret}&issuer=Ascentia`
      }
    });
  } catch (error) {
    console.error("❌ 2FA SETUP ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to setup 2FA", 
      error: error.message 
    });
  }
};

// POST /api/users/me/2fa/disable - Disable 2FA
export const disableTwoFactor = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.employee.update({
      where: { id: parseInt(userId) },
      data: { 
        twoFactorSecret: null,
        twoFactorEnabled: false
      }
    });

    await logDatabaseOperation({ 
      operation: 'UPDATE', 
      entityType: 'user', 
      entityId: parseInt(userId), 
      userId: parseInt(userId), 
      details: { action: '2fa_disable' } 
    });

    // console.log("✅ 2FA disabled:", userId);
    res.json({ 
      success: true, 
      message: 'Two-factor authentication disabled successfully' 
    });
  } catch (error) {
    console.error("❌ 2FA DISABLE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to disable 2FA", 
      error: error.message 
    });
  }
};

// POST /api/users/me/profile-picture - Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // For now, store the file path. In production, you'd upload to cloud storage
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    
    // Update user's profile picture in database
    const updatedUser = await prisma.employee.update({
      where: { id: parseInt(userId) },
      data: { profilePicture: profilePictureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true
      }
    });

    await logDatabaseOperation({ 
      operation: 'UPDATE', 
      entityType: 'user', 
      entityId: parseInt(userId), 
      userId: parseInt(userId), 
      details: { action: 'profile_picture_upload', url: profilePictureUrl } 
    });

    // console.log("✅ Profile picture uploaded:", userId, profilePictureUrl);
    res.json({ 
      success: true, 
      message: 'Profile picture uploaded successfully', 
      data: { profilePicture: profilePictureUrl }
    });
  } catch (error) {
    console.error("❌ UPLOAD PROFILE PICTURE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload profile picture", 
      error: error.message 
    });
  }
};

// POST /api/users - Create new user (admin only)
export const createNewUser = async (req, res) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;
    const adminUserId = req.user.id;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

    const validRoles = ['admin', 'employee'];
    if (!validRoles.includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin or employee' });

    const existing = await prisma.employee.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.employee.create({
      data: { name, email, password: hashedPassword, role, status: 'active', createdBy: adminUserId },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });

    await logDatabaseOperation({ operation: 'CREATE', entityType: 'user', entityId: newUser.id, userId: adminUserId, details: { name, email, role } });
    // console.log("✅ User created in database:", newUser.id, newUser.email);
    res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
  } catch (error) {
    console.error("❌ CREATE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to create user", error: error.message });
  }
};

export default {
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  deleteUser,
  createNewUser
};
