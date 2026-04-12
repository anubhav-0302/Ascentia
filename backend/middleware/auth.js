import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

// Authentication middleware - database only
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: "Access token required" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "secret123");

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!dbUser)
      return res.status(401).json({ success: false, message: 'Invalid token - user not found' });

    req.user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role, createdAt: dbUser.createdAt };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export default { requireAuth, authorize };
