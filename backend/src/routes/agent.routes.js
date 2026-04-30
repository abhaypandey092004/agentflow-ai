const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createAgentSchema, updateAgentSchema } = require('../utils/validators');

// All agent routes are protected
router.use(authMiddleware);

router.get('/', agentController.getAllAgents);
router.get('/:id', agentController.getAgentById);
router.post('/', validate(createAgentSchema), agentController.createAgent);
router.put('/:id', validate(updateAgentSchema), agentController.updateAgent);
router.delete('/:id', agentController.deleteAgent);

module.exports = router;
