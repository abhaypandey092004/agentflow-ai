const supabase = require('../config/supabase');
const workflowQueue = require('../queues/workflow.queue');
const aiService = require('./ai.service');
const { searchWeb } = require('./search.service');

/**
 * Public API to initiate a workflow run
 */
const runWorkflow = async (userId, workflowId, initialInput = '') => {
  // 0. Security Validation
  const trimmedInput = initialInput.trim();
  if (trimmedInput.length > 4000) {
    throw new Error('Input too long. Max 4000 characters allowed.');
  }

  // Basic sanitization
  const sanitizedInput = trimmedInput.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gmi, '')
                                     .replace(/<[^>]*>?/gm, '');

  // 1. Fetch workflow and its steps
  const { data: workflow, error } = await supabase
    .from('workflows')
    .select(`
      id,
      name,
      workflow_steps(id, name, type, prompt, model, order_number)
    `)
    .eq('id', workflowId)
    .eq('user_id', userId)
    .single();

  if (error || !workflow) {
    throw new Error('Workflow not found or access denied');
  }

  if (!workflow.workflow_steps || workflow.workflow_steps.length === 0) {
    throw new Error('Workflow has no steps to execute');
  }

  if (workflow.workflow_steps.length > 10) {
    throw new Error('Workflow exceeds maximum step limit (10).');
  }

  // Sort steps by order
  const steps = workflow.workflow_steps.sort((a, b) => a.order_number - b.order_number);

  // 2. Create execution record
  const { data: execution, error: executionError } = await supabase
    .from('workflow_executions')
    .insert({
      user_id: userId,
      workflow_id: workflowId,
      status: 'pending',
    })
    .select()
    .single();

  if (executionError) {
    throw new Error('Failed to create execution record');
  }

  // 3. Enqueue via BullMQ for production processing
  try {
    await workflowQueue.add(`execute-${execution.id}`, {
      userId,
      executionId: execution.id,
      workflowId,
      steps,
      initialInput: sanitizedInput
    });
  } catch (queueError) {
    console.error('Failed to add job to queue:', queueError);

    await supabase
      .from('workflow_executions')
      .update({
        status: 'failed',
        result: 'Workflow engine is currently unavailable. Please try again later.',
      })
      .eq('id', execution.id);

    throw new Error('Workflow engine is currently unavailable');
  }

  return execution;
};

module.exports = { runWorkflow };
