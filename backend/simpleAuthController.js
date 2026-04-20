import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./lib/prisma.js";
import { validateEmail } from "./utils/emailValidator.js";

// Login: database only - now works with Employee model
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    // Validate email format
    const emailValidation = validateEmail(email, { requireProfessionalTLD: true });
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error });
    }

    const employee = await prisma.employee.findFirst({ where: { email } });
    if (!employee || !employee.password) {
      console.log("❌ Employee not found or no password:", email);
      return res.status(401).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    // Update last login
    await prisma.employee.update({
      where: { id: employee.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign({ id: employee.id, role: employee.role }, "secret123", { expiresIn: "7d" });

    console.log("✅ Login successful:", employee.email);
    return res.json({
      success: true,
      message: "Login successful",
      data: { 
        token, 
        user: { 
          id: employee.id, 
          name: employee.name, 
          email: employee.email, 
          role: employee.role,
          jobTitle: employee.jobTitle,
          department: employee.department
        } 
      }
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

// Register: database only - now works with Employee model
// Verify password for sensitive data access
export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const employee = await prisma.employee.findUnique({ where: { id: userId } });
    if (!employee || !employee.password) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Password verified successfully
    return res.json({
      success: true,
      message: "Password verified successfully",
      timestamp: new Date().toISOString() // For session tracking
    });
  } catch (err) {
    console.error("❌ PASSWORD VERIFICATION ERROR:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Register: database only - now works with Employee model
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'employee', jobTitle, department } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });

    // Validate email format
    const emailValidation = validateEmail(email, { requireProfessionalTLD: true });
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: emailValidation.error });
    }

    const existing = await prisma.employee.findFirst({ where: { email } });
    if (existing)
      return res.status(400).json({ success: false, message: "User with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await prisma.employee.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role, 
        status: 'active',
        jobTitle: jobTitle || 'Employee',
        department: department || 'General',
        location: 'Main Office'
      }
    });

    const token = jwt.sign({ id: employee.id, role: employee.role }, "secret123", { expiresIn: "7d" });

    console.log("✅ Employee registered in database:", employee.email);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { 
        user: { 
          id: employee.id, 
          name: employee.name, 
          email: employee.email, 
          role: employee.role,
          jobTitle: employee.jobTitle,
          department: employee.department,
          createdAt: employee.createdAt 
        }, 
        token 
      }
    });
  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error during registration", error: error.message });
  }
};

// Get current user (simplified) - now works with Employee model
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    // Get full employee data from database
    const employee = await prisma.employee.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        department: true,
        location: true,
        status: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Employee not found" 
      });
    }

    res.json({
      success: true,
      data: { user: employee }
    });
  } catch (error) {
    console.error("❌ GET USER ERROR:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
};

// Forgot Password: Send password reset instructions
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email address is required" 
      });
    }

    // Check if user exists
    const employee = await prisma.employee.findFirst({ where: { email } });
    
    if (!employee) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        success: true, 
        message: "If an account with that email exists, password reset instructions have been sent." 
      });
    }

    // In a real implementation, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with an expiry
    // 3. Send an email with the reset link
    // For now, we'll just log it and return success
    console.log("🔑 Password reset requested for:", email);
    console.log("📧 In production, send reset email to:", email);

    // For demo purposes, we'll just return success
    // In production, you would integrate with an email service
    res.json({ 
      success: true, 
      message: "Password reset instructions have been sent to your email address." 
    });
  } catch (error) {
    console.error("❌ FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process password reset request" 
    });
  }
};
