const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', templateController.getTemplates);

module.exports = router;
