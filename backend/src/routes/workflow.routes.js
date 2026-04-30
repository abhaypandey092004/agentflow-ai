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
router.post('/:id/run', workflowController.runWorkflowEndpoint);

module.exports = router;
