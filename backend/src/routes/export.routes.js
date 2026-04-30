const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/pdf', exportController.exportPdf);
router.post('/docx', exportController.exportDocx);

module.exports = router;
