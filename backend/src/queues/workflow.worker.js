const { Worker } = require('bullmq');
const redisConnection = require('../config/redis');
const supabase = require('../config/supabase');
const openrouterService = require('../services/openrouter.service');
const { searchWeb } = require('../services/search.service');
const { getIo } = require('../socket');

const systemPrompts = {
  research: "You are a world-class research analyst. Analyze the provided search data and extract critical facts, statistics, and insights. Structure your findings logically.",
  summarize: "You are an expert at synthesis. Take the provided information and distill it into a concise, high-impact summary while retaining all essential nuances.",
  generate: "You are an elite content creator and copywriter. Create engaging, high-quality content that is SEO-optimized, well-structured with headings, and perfectly tailored to the user's objective.",
  rewrite: "You are a meticulous editor. Refine the provided text for clarity, tone, and professional impact.",
  extract: "You are a data extraction specialist. Identify and structure key entities, dates, and metrics from the provided text into a clean format.",
  custom: "You are a helpful AI assistant tasked with following instructions precisely."
};

const emitUpdate = (userId, event, payload) => {
  try {
    const io = getIo();
    io.to(`user_${userId}`).emit(event, payload);
  } catch (error) {
    console.error('Socket.io error:', error.message);
  }
};

console.log('👷 Workflow Worker started and listening for jobs...');

const processWorkflow = async (job) => {
  const { userId, executionId, workflowId, steps, initialInput } = job.data;
  let previousOutput = initialInput || '';

  console.log(`[WORKER] 📥 Job Received: ${job.id} | Execution: ${executionId}`);

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
        const systemPrompt = systemPrompts[step.type] || systemPrompts.custom;

        if (step.type === 'research') {
          // 1. Perform real web search
          const searchQuery = processedPrompt;
          console.log(`[WORKER] Performing web search for: ${searchQuery}`);
          const searchData = await searchWeb(searchQuery);

          // 2. Pass search results to AI for structured analysis
          result = await Promise.race([
            openrouterService.runAI(
              userId,
              `Analyze and structure the following research data based on this objective: ${processedPrompt}\n\nRESEARCH DATA:\n${searchData}`,
              systemPrompt
            ),
            timeoutPromise
          ]);
        } else {
          // Standard AI step
          result = await Promise.race([
            openrouterService.runAI(
              userId,
              processedPrompt,
              systemPrompt
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
  console.log(`[WORKER] ✅ Job Completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.log(`[WORKER] ❌ Job Failed: ${job.id} | Error: ${err.message}`);
});


module.exports = worker;
