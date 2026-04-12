import prisma from '../lib/prisma.js';
import { logDatabaseOperation } from '../databaseLogger.js';
import bcrypt from 'bcryptjs';

// GET /api/users - Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true,
        status: true, lastLogin: true, createdAt: true
      }
    });
    console.log(`📊 getAllUsers: returned ${users.length} users from database`);
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
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true, name: true, email: true, role: true,
        status: true, lastLogin: true, createdAt: true
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

    const existing = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    if (parseInt(id) === adminUserId && role && role !== existing.role)
      return res.status(400).json({ success: false, message: 'Cannot change your own role' });

    const validRoles = ['admin', 'employee'];
    if (role && !validRoles.includes(role))
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin or employee' });

    const updated = await prisma.user.update({
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
    console.log("✅ User updated in database:", updated.id);
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

    const existing = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });

    await logDatabaseOperation({ operation: 'UPDATE', entityType: 'user', entityId: parseInt(id), userId: adminUserId, details: { action: 'password_reset' } });
    console.log("✅ User password reset in database:", id);
    res.json({ success: true, message: 'Password reset successfully', data: { id: parseInt(id), email: existing.email } });
  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
  }
};

// DELETE /api/users/:id - Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    if (parseInt(id) === adminUserId)
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });

    const existing = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    await logDatabaseOperation({ operation: 'DELETE', entityType: 'user', entityId: parseInt(id), userId: adminUserId, details: { email: existing.email } });
    console.log("✅ User deleted from database:", id);
    res.json({ success: true, message: 'User deleted successfully', data: { id: parseInt(id), email: existing.email } });
  } catch (error) {
    console.error("❌ DELETE USER ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, status: 'active', createdBy: adminUserId },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });

    await logDatabaseOperation({ operation: 'CREATE', entityType: 'user', entityId: newUser.id, userId: adminUserId, details: { name, email, role } });
    console.log("✅ User created in database:", newUser.id, newUser.email);
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
