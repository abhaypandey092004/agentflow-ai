const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Setup multer for temporary local storage before uploading to Supabase
const upload = multer({ dest: 'uploads/' });

// All upload routes are protected
router.use(authMiddleware);

router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/:id/parse', uploadController.parseDocument);

module.exports = router;
