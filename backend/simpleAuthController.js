import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma.js";

// Login: database only
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, "secret123", { expiresIn: "7d" });

    console.log("✅ Login successful:", user.email);
    return res.json({
      success: true,
      message: "Login successful",
      data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

// Register: database only
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'employee' } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, status: 'active' }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret123", { expiresIn: "7d" });

    console.log("✅ User registered in database:", user.email);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }, token }
    });
  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error during registration", error: error.message });
  }
};

// Get current user (simplified)
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error("❌ GET USER ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};
