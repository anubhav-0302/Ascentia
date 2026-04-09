import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "./userStore.js";

// Clean login implementation with in-memory store
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 LOGIN BODY:", req.body);

    if (!email || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = findUserByEmail(email);

    console.log("🔍 USER:", user ? { id: user.id, email: user.email, role: user.role } : null);

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
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
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

// Clean register implementation with in-memory store
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    console.log("🔍 REGISTER BODY:", req.body);

    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        success: false,
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
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
    const user = createUser({
      name,
      email,
      password: hashedPassword,
      role
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
