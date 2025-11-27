import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (tăng lên cho video)
  },
  fileFilter: (req, file, cb) => {
    // Allowed extensions
    const allowedExtensions = /\.(pdf|doc|docx|ppt|pptx|txt|zip|rar|xls|xlsx|csv|mp4|avi|mov|wmv|flv|mkv|mp3|wav|aac|flac|ogg|wma)$/i;
    const extname = allowedExtensions.test(file.originalname.toLowerCase());
    
    const allowedMimetypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/x-matroska',
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'audio/flac',
      'audio/ogg',
      'audio/x-ms-wma'
    ];
    
    const mimetypeAllowed = allowedMimetypes.includes(file.mimetype);
    
    if (extname || mimetypeAllowed) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, XLS, XLSX, CSV, MP4, AVI, MOV, WMV, FLV, MKV, MP3, WAV, AAC, FLAC, OGG, WMA'));
    }
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file được upload' });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload thất bại' });
  }
});

router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File không tồn tại' });
    }
    const parts = filename.split('-');
    const ext = path.extname(filename);
    const originalName = parts.slice(0, -2).join('-') + ext;
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Không thể tải file' });
  }
});

export default router;
