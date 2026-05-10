import prisma from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { tenantWhere } from '../helpers/tenantHelper.js';

// POST /api/documents/upload - Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.id;
    const tenant = tenantWhere(req);
    
    // Check if user is admin or uploading their own document
    const isAdmin = req.user.role === 'admin';
    const isOwnDocument = parseInt(employeeId) === userId;
    
    if (!isAdmin && !isOwnDocument) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only upload documents for yourself or need admin privileges'
      });
    }
    
    // Verify the target employee belongs to the same tenant
    if (isAdmin) {
      const targetEmployee = await prisma.employee.findFirst({
        where: { id: parseInt(employeeId), ...tenant }
      });
      if (!targetEmployee) {
        return res.status(403).json({ success: false, message: 'Access denied: Employee not found in your organization' });
      }
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
        fileSize: req.file.size,
        organizationId: req.user.organizationId
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
      message: 'Failed to upload document'
    });
  }
};

// GET /api/documents/:employeeId - Get all documents for an employee
export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user.id;
    const tenant = tenantWhere(req);
    
    // Check if user is admin or viewing their own documents
    const isAdmin = req.user.role === 'admin';
    const isOwnDocuments = parseInt(employeeId) === userId;
    
    if (!isAdmin && !isOwnDocuments) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own documents or need admin privileges'
      });
    }
    
    // Verify the target employee belongs to the same tenant
    if (isAdmin) {
      const targetEmployee = await prisma.employee.findFirst({
        where: { id: parseInt(employeeId), ...tenant }
      });
      if (!targetEmployee) {
        return res.status(403).json({ success: false, message: 'Access denied: Employee not found in your organization' });
      }
    }
    
    const documents = await prisma.document.findMany({
      where: {
        employeeId: parseInt(employeeId),
        ...tenant
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
      message: 'Failed to fetch documents'
    });
  }
};

// DELETE /api/documents/:id - Delete a document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tenant = tenantWhere(req);
    
    // Get document to verify ownership (scoped to tenant)
    const document = await prisma.document.findFirst({
      where: { id: parseInt(id), ...tenant },
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
    
    // Delete file from filesystem — resolve against uploads dir to prevent path traversal
    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'documents');
    const filePath = path.resolve(uploadsDir, document.fileName);
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return res.status(400).json({ success: false, message: 'Invalid file path' });
    }
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
      message: 'Failed to delete document'
    });
  }
};

// GET /api/documents/:id/download - Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tenant = tenantWhere(req);
    
    // Get document to verify ownership (scoped to tenant)
    const document = await prisma.document.findFirst({
      where: { id: parseInt(id), ...tenant },
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
    
    // Resolve against uploads dir to prevent path traversal
    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'documents');
    const filePath = path.resolve(uploadsDir, document.fileName);
    if (!filePath.startsWith(uploadsDir + path.sep)) {
      return res.status(400).json({ success: false, message: 'Invalid file path' });
    }
    
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
      message: 'Failed to download document'
    });
  }
};
