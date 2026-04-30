const supabase = require('../config/supabase');

const getAllExecutions = async (req, res, next) => {
  try {
    const { data: executions, error } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflows(name, agent_id, agents(name))
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(executions);
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

module.exports = {
  getAllExecutions,
  getExecutionById
};
