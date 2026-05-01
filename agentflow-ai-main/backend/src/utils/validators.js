const { z } = require('zod');

// Agent Validations
const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional(),
  }),
});

const updateAgentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100).optional(),
    description: z.string().optional(),
  }),
});

// Workflow Validations
const workflowStepSchema = z.object({
  name: z.string().min(1, "Step name is required").max(100),
  type: z.enum(['research', 'summarize', 'generate', 'rewrite', 'extract', 'custom']),
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().default('nemotron-3-nano-free'),
  order_number: z.number().int().min(1),
});

const createWorkflowSchema = z.object({
  body: z.object({
    agent_id: z.string().uuid("Invalid agent ID"),
    name: z.string().min(1, "Workflow name is required").max(100),
    description: z.string().optional(),
    steps: z.array(workflowStepSchema)
      .min(1, "At least one step is required")
      .max(10, "Maximum 10 steps allowed per workflow"),
  }),
});

const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Workflow name is required").max(100).optional(),
    description: z.string().optional(),
    steps: z.array(workflowStepSchema)
      .max(10, "Maximum 10 steps allowed per workflow")
      .optional(),
  }),
});

module.exports = {
  createAgentSchema,
  updateAgentSchema,
  createWorkflowSchema,
  updateWorkflowSchema,
};
