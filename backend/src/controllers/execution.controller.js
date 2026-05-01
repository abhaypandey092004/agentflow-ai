const supabase = require('../config/supabase');

const getAllExecutions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: executions, error, count } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflows(name, agent_id, agents(name))
      `, { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    res.json({
      data: executions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const getExecutionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Fetch execution with its step executions
    const { data: execution, error } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflows(name, description),
        step_executions(*, workflow_steps(name, type, order_number))
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    // Sort step executions by order_number
    if (execution.step_executions) {
      execution.step_executions.sort(
        (a, b) => a.workflow_steps.order_number - b.workflow_steps.order_number
      );
    }

    res.json(execution);
  } catch (err) {
    next(err);
  }
};


const executeWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { input = "" } = req.body || {};
    const { runWorkflow } = require('../services/workflowRunner.service');
    
    console.log(`[CONTROLLER] Initiating workflow ${id} for user ${req.user.id}`);
    
    const execution = await runWorkflow(req.user.id, id, input);
    
    res.status(202).json({ 
      message: 'Workflow execution started', 
      executionId: execution.id 
    });
  } catch (err) {
    console.error(`[CONTROLLER] Execution failed for workflow ${req.params.id}:`, err.message);
    
    if (err.message === 'Workflow not found or access denied') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Workflow has no steps to execute') {
      return res.status(400).json({ error: err.message });
    }
    
    // For other errors, return a clean message to frontend but log the details
    res.status(500).json({ error: 'Failed to execute workflow. Please try again.' });
  }
};

module.exports = {
  getAllExecutions,
  getExecutionById,
  executeWorkflow
};

