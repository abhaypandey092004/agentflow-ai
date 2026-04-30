const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const supabase = require('../config/supabase');
const aiService = require('../services/ai.service');
const { searchWeb } = require('../services/search.service');
const { getIo } = require('../socket');

const emitUpdate = (userId, event, payload) => {
  try {
    const io = getIo();
    io.to(`user_${userId}`).emit(event, payload);
  } catch (error) {
    console.error('Socket.io error:', error.message);
  }
};

const processWorkflow = async (job) => {
  const { userId, executionId, workflowId, steps, initialInput } = job.data;
  let previousOutput = initialInput || '';

  console.log(`[WORKER] Starting Job ${job.id} | Execution: ${executionId}`);

  try {
    // Update execution status
    await supabase
      .from('workflow_executions')
      .update({ status: 'processing' })
      .eq('id', executionId);

    emitUpdate(userId, 'workflow_started', { executionId, workflowId });

    // Process each step sequentially
    for (const step of steps) {
      console.log(`[WORKER] Job ${job.id} | Processing Step: ${step.name} (${step.type})`);

      // Create step execution record
      const { data: stepExecution, error: stepCreateError } = await supabase
        .from('step_executions')
        .insert({
          execution_id: executionId,
          step_id: step.id,
          status: 'processing'
        })
        .select()
        .single();

      if (stepCreateError) throw new Error(`Failed to create step execution: ${stepCreateError.message}`);

      // Process template variables in prompt
      const currentInput = previousOutput || '';
      const processedPrompt = step.prompt
        .replace(/{{input}}/g, currentInput)
        .replace(/{{previous_output}}/g, currentInput)
        .replace(/{{step_output}}/g, currentInput);

      emitUpdate(userId, 'step_started', { 
        executionId, 
        stepExecutionId: stepExecution.id, 
        stepId: step.id,
        processedPrompt
      });

      try {
        // Execute AI task with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out after 60 seconds')), 60000)
        );

        let result = '';

        if (step.type === 'research') {
          // 1. Perform real web search
          const searchQuery = processedPrompt;
          console.log(`[WORKER] Performing web search for: ${searchQuery}`);
          const searchData = await searchWeb(searchQuery);

          // 2. Pass search results to AI for structured analysis
          result = await Promise.race([
            aiService.executeStep(
              'research',
              `Analyze and structure the following research data based on this objective: ${processedPrompt}\n\nRESEARCH DATA:\n${searchData}`,
              step.model,
              previousOutput
            ),
            timeoutPromise
          ]);
        } else {
          // Standard AI step
          result = await Promise.race([
            aiService.executeStep(
              step.type,
              processedPrompt,
              step.model,
              previousOutput
            ),
            timeoutPromise
          ]);
        }

        console.log(`[WORKER] Job ${job.id} | Step Completed: ${step.name}`);

        // Update step status
        await supabase
          .from('step_executions')
          .update({ status: 'completed', result })
          .eq('id', stepExecution.id);

        emitUpdate(userId, 'step_completed', { executionId, stepExecutionId: stepExecution.id, result });
        
        // Pass output to next step
        previousOutput = result;
      } catch (stepError) {
        console.error(`[WORKER] Job ${job.id} | Step Failed: ${step.name} | Error: ${stepError.message}`);
        
        // Update step status as failed
        await supabase
          .from('step_executions')
          .update({ status: 'failed', error: stepError.message })
          .eq('id', stepExecution.id);

        emitUpdate(userId, 'step_failed', { executionId, stepExecutionId: stepExecution.id, error: stepError.message });
        throw stepError; // Rethrow to stop workflow and mark job as failed
      }
    }

    // Workflow completed successfully
    await supabase
      .from('workflow_executions')
      .update({ status: 'completed', result: previousOutput })
      .eq('id', executionId);

    emitUpdate(userId, 'workflow_completed', { executionId, result: previousOutput });
    
    console.log(`[WORKER] Job ${job.id} | Workflow Completed Successfully`);

    // Log audit action
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'workflow_completed',
      details: { executionId, workflowId }
    });

    return { status: 'completed', finalOutput: previousOutput };

  } catch (error) {
    console.error(`[WORKER] Job ${job.id} | Workflow Failed: ${executionId} | Error: ${error.message}`);
    
    // Update execution status as failed
    await supabase
      .from('workflow_executions')
      .update({ status: 'failed', result: error.message })
      .eq('id', executionId);

    emitUpdate(userId, 'workflow_failed', { executionId, error: error.message });
    
    // Log audit action
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'workflow_failed',
      details: { executionId, workflowId, error: error.message }
    });

    throw error;
  }
};

const worker = new Worker('workflow-execution', processWorkflow, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 workflows concurrently
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} has failed with ${err.message}`);
});

module.exports = worker;
