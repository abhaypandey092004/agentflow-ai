const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/authMiddleware');
const path = require('path');
const multer = require('multer');

// Setup multer for temporary local storage with security constraints
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Security Block: Invalid file type. Only PDF, DOC, DOCX, TXT, and MD are permitted.'));
    }
  }
});

// All upload routes are protected
router.use(authMiddleware);

router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/:id/parse', uploadController.parseDocument);
router.delete('/:id', uploadController.deleteFile);

module.exports = router;
