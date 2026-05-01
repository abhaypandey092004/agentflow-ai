const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createWorkflowSchema, updateWorkflowSchema } = require('../utils/validators');

// All workflow routes are protected
router.use(authMiddleware);

router.get('/', workflowController.getAllWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.post('/', validate(createWorkflowSchema), workflowController.createWorkflow);
router.put('/:id', validate(updateWorkflowSchema), workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);
const rateLimit = require('express-rate-limit');

const aiValidator = require('../middleware/aiValidator');

// Rate limiting for workflow execution (AI calls are expensive)
const runLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 runs per window
  message: { error: 'Too many executions. Please wait 15 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id
});

router.post('/:id/run', aiValidator, runLimiter, workflowController.runWorkflowEndpoint);

module.exports = router;
