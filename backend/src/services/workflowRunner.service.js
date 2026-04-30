const supabase = require('../config/supabase');
const workflowQueue = require('../queues/workflow.queue');

const runWorkflow = async (userId, workflowId) => {
  // 1. Fetch workflow and its steps
  const { data: workflow, error } = await supabase
    .from('workflows')
    .select(`
      id,
      workflow_steps(id, type, prompt, model, order_number)
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

  // Sort steps
  const steps = workflow.workflow_steps.sort((a, b) => a.order_number - b.order_number);

  // 2. Create Execution Record
  const { data: execution, error: executionError } = await supabase
    .from('workflow_executions')
    .insert({
      user_id: userId,
      workflow_id: workflowId,
      status: 'pending'
    })
    .select()
    .single();

  if (executionError) {
    throw new Error('Failed to create execution record');
  }

  // Log audit action
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'workflow_run_initiated',
    details: { executionId: execution.id, workflowId }
  });

  // 3. Add to BullMQ Queue
  try {
    await workflowQueue.add(`execute-${execution.id}`, {
      userId,
      executionId: execution.id,
      workflowId,
      steps
    });
  } catch (queueError) {
    console.error('Failed to add job to queue:', queueError);
    
    // Mark as failed if queue is down
    await supabase
      .from('workflow_executions')
      .update({ status: 'failed', result: 'Workflow queue is currently unavailable. Please try again later.' })
      .eq('id', execution.id);
      
    throw new Error('Workflow queue is currently unavailable');
  }

  return execution;
};

module.exports = {
  runWorkflow
};
