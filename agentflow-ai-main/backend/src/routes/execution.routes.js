const express = require('express');
const router = express.Router();
const executionController = require('../controllers/execution.controller');
const authMiddleware = require('../middleware/authMiddleware');

// All execution routes are protected
router.use(authMiddleware);

router.get('/', executionController.getAllExecutions);
router.get('/:id', executionController.getExecutionById);

module.exports = router;
