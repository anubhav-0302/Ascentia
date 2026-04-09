import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Clean register implementation
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    console.log("🔍 REGISTER BODY:", req.body);

    // Validate input
    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    // Hash password
    console.log("🔍 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed successfully");

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    console.log("✅ User created:", { id: user.id, email: user.email });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secret123",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error);
    console.error("❌ ERROR STACK:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      error: error.message
    });
  }
};

// Clean login implementation
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(" LOGIN BODY:", req.body);

    if (!email || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("🔍 USER:", user);

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    console.log("🔍 PASSWORD MATCH:", validPassword);

    if (!validPassword) {
      console.log("❌ Invalid password");
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "secret123",
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful, token generated");

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR FULL:", err);
    console.error("❌ ERROR STACK:", err.stack);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: err.message 
    });
  }
};

// Get current user (protected route)
export const getCurrentUser = async (req, res) => {
  try {
    // User should be attached by auth middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default { register, login, getCurrentUser };
