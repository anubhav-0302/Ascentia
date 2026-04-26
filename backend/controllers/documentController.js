import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';

// POST /api/documents/upload - Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.id;
    
    // Check if user is admin or uploading their own document
    const isAdmin = req.user.role === 'admin';
    const isOwnDocument = parseInt(employeeId) === userId;
    
    if (!isAdmin && !isOwnDocument) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only upload documents for yourself or need admin privileges'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create file URL
    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    // Save document to database
    const document = await prisma.document.create({
      data: {
        employeeId: parseInt(employeeId),
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: fileUrl,
        fileSize: req.file.size
      }
    });
    
    // console.log('✅ Document uploaded:', document.id, 'for employee:', employeeId);
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('❌ Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// GET /api/documents/:employeeId - Get all documents for an employee
export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.id;
    
    // Check if user is admin or viewing their own documents
    const isAdmin = req.user.role === 'admin';
    const isOwnDocuments = parseInt(employeeId) === userId;
    
    if (!isAdmin && !isOwnDocuments) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own documents or need admin privileges'
      });
    }
    
    const documents = await prisma.document.findMany({
      where: {
        employeeId: parseInt(employeeId)
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// DELETE /api/documents/:id - Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get document to verify ownership
    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if user is admin or document owner
    const isAdmin = req.user.role === 'admin';
    const isOwnDocument = document.employeeId === userId;
    
    if (!isAdmin && !isOwnDocument) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own documents or need admin privileges'
      });
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    await prisma.document.delete({
      where: { id: parseInt(id) }
    });
    
    // console.log('✅ Document deleted:', id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// GET /api/documents/:id/download - Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get document to verify ownership
    const document = await prisma.document.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true }
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if user is admin or document owner
    const isAdmin = req.user.role === 'admin';
    const isOwnDocument = document.employeeId === userId;
    
    if (!isAdmin && !isOwnDocument) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only download your own documents or need admin privileges'
      });
    }
    
    const filePath = path.join(process.cwd(), document.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('❌ Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};
