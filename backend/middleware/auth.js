import jwt from 'jsonwebtoken';
import { getUsers } from '../userStore.js';

// Selective authentication middleware (applied only to protected routes)
export const requireAuth = (req, res, next) => {
  try {
    console.log("🔍 REQUIRE AUTH:", req.method, req.url);
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ No auth header or invalid format");
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with hardcoded secret
    const decoded = jwt.verify(token, "secret123");

    // Find user in memory store
    const users = getUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      console.log("❌ User not found for token");
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Attach user to request (without password)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
    
    console.log("✅ Authenticated user:", req.user.email);
    next();
  } catch (err) {
    console.error("❌ Authentication error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
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
