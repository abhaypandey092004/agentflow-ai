const supabase = require('../config/supabase');
const workflowQueue = require('../queues/workflow.queue');
const env = require('../config/env');
const aiService = require('./ai.service');

// ─── Inline runner (mock mode only) ───────────────────────────────────────────
// Runs in the same Node.js process as the HTTP server so getIo() is always
// available. Called via setImmediate so the HTTP response is sent first.

const runWorkflowInline = async (userId, executionId, workflowId, steps) => {
  let previousOutput = '';

  // Import socket lazily to avoid circular-require issues at module load time
  let emitUpdate = () => {};
  try {
    const { getIo } = require('../socket');
    emitUpdate = (event, payload) => {
      try {
        getIo().to(`user_${userId}`).emit(event, payload);
      } catch (_) {
        // socket not ready – ok in tests
      }
    };
  } catch (_) {}

  console.log(`[MOCK-RUNNER] Starting inline execution: ${executionId}`);

  try {
    await supabase
      .from('workflow_executions')
      .update({ status: 'processing' })
      .eq('id', executionId);

    emitUpdate('workflow_started', { executionId, workflowId });

    for (const step of steps) {
      console.log(`[MOCK-RUNNER] Step: ${step.name} (${step.type})`);

      // Create step execution record
      const { data: stepExecution, error: stepCreateError } = await supabase
        .from('step_executions')
        .insert({
          execution_id: executionId,
          step_id: step.id,
          status: 'processing',
        })
        .select()
        .single();

      if (stepCreateError) {
        throw new Error(`Failed to create step execution: ${stepCreateError.message}`);
      }

      emitUpdate('step_started', {
        executionId,
        stepExecutionId: stepExecution.id,
        stepId: step.id,
      });

      try {
        // 30-second safety timeout per step
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Step timed out after 30 seconds')), 30000)
        );

        const result = await Promise.race([
          aiService.executeStep(step.type, step.prompt, step.model, previousOutput),
          timeoutPromise,
        ]);

        await supabase
          .from('step_executions')
          .update({ status: 'completed', result })
          .eq('id', stepExecution.id);

        emitUpdate('step_completed', {
          executionId,
          stepExecutionId: stepExecution.id,
          result,
        });

        previousOutput = result;
        console.log(`[MOCK-RUNNER] Step completed: ${step.name}`);
      } catch (stepError) {
        console.error(`[MOCK-RUNNER] Step failed: ${step.name} | ${stepError.message}`);

        await supabase
          .from('step_executions')
          .update({ status: 'failed', error: stepError.message })
          .eq('id', stepExecution.id);

        emitUpdate('step_failed', {
          executionId,
          stepExecutionId: stepExecution.id,
          error: stepError.message,
        });

        throw stepError;
      }
    }

    // ── All steps done → mark completed ───────────────────────────────────────
    await supabase
      .from('workflow_executions')
      .update({ status: 'completed', result: previousOutput })
      .eq('id', executionId);

    emitUpdate('workflow_completed', { executionId, result: previousOutput });

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'workflow_completed',
      details: { executionId, workflowId },
    });

    console.log(`[MOCK-RUNNER] Workflow completed: ${executionId}`);
  } catch (error) {
    console.error(`[MOCK-RUNNER] Workflow failed: ${executionId} | ${error.message}`);

    await supabase
      .from('workflow_executions')
      .update({ status: 'failed', result: error.message })
      .eq('id', executionId);

    emitUpdate('workflow_failed', { executionId, error: error.message });

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'workflow_failed',
      details: { executionId, workflowId, error: error.message },
    });
  }
};

// ─── Public API ────────────────────────────────────────────────────────────────

const runWorkflow = async (userId, workflowId) => {
  // 1. Fetch workflow and its steps
  const { data: workflow, error } = await supabase
    .from('workflows')
    .select(`
      id,
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

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'workflow_run_initiated',
    details: { executionId: execution.id, workflowId },
  });

  // 3a. MOCK MODE → run inline in the same process (no BullMQ / Redis required)
  if (env.openai.mockMode) {
    console.log(`[MOCK-RUNNER] Mock mode active — bypassing BullMQ for execution: ${execution.id}`);
    // setImmediate lets the HTTP response return before processing starts
    setImmediate(() => runWorkflowInline(userId, execution.id, workflowId, steps));
    return execution;
  }

  // 3b. REAL MODE → enqueue via BullMQ
  try {
    await workflowQueue.add(`execute-${execution.id}`, {
      userId,
      executionId: execution.id,
      workflowId,
      steps,
    });
  } catch (queueError) {
    console.error('Failed to add job to queue:', queueError);

    await supabase
      .from('workflow_executions')
      .update({
        status: 'failed',
        result: 'Workflow queue is currently unavailable. Please try again later.',
      })
      .eq('id', execution.id);

    throw new Error('Workflow queue is currently unavailable');
  }

  return execution;
};

module.exports = { runWorkflow };
