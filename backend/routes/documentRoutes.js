import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadDocument, getEmployeeDocuments, deleteDocument, downloadDocument } from '../controllers/documentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create documents directory if it doesn't exist
const documentsDir = path.join(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common document formats
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype.includes('application/pdf') ||
                    file.mimetype.includes('application/msword') ||
                    file.mimetype.includes('application/vnd.openxmlformats') ||
                    file.mimetype.includes('text/') ||
                    file.mimetype.includes('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF)'));
    }
  }
});

// POST /api/documents/upload - Upload a document
router.post('/upload', requireAuth, upload.single('document'), uploadDocument);

// GET /api/documents/:employeeId - Get all documents for an employee
router.get('/:employeeId', requireAuth, getEmployeeDocuments);

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', requireAuth, deleteDocument);

// GET /api/documents/:id/download - Download a document
router.get('/:id/download', requireAuth, downloadDocument);

export default router;
