const supabase = require('../config/supabase');

const getAllAgents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: agents, error, count } = await supabase
      .from('agents')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    res.json({
      data: agents,
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

const getAgentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (err) {
    next(err);
  }
};

const createAgent = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    // 1. Create the Agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        user_id: req.user.id,
        name,
        description
      })
      .select()
      .single();

    if (agentError) throw agentError;

    // 2. Automatically generate the workflow
    const workflowName = `${name} Default Pipeline`;
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: req.user.id,
        agent_id: agent.id,
        name: workflowName,
        description: 'Auto-generated multi-step reasoning pipeline for this agent.'
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // 3. Insert default steps: Research, Processing, Final Output
    // We will use the user's prompt (description) in the first step.
    const stepsToInsert = [
      {
        workflow_id: workflow.id,
        name: 'Research & Planning',
        type: 'research',
        prompt: `System: You are ${name}. \nUser objective: ${description}\n\nPlan the approach and gather any required logical context based on the input: {{input}}`,
        model: 'openai/gpt-4o-mini',
        order_number: 1
      },
      {
        workflow_id: workflow.id,
        name: 'Processing & Reasoning',
        type: 'custom',
        prompt: `System: You are the core processing engine. Analyze the research from the previous step and generate a structured draft.\n\nInput from previous step: {{input}}`,
        model: 'openai/gpt-4o-mini',
        order_number: 2
      },
      {
        workflow_id: workflow.id,
        name: 'Final Output Generation',
        type: 'generate',
        prompt: `System: Format the final response cleanly and professionally based on the processed draft.\n\nProcessed draft: {{input}}`,
        model: 'openai/gpt-4o-mini',
        order_number: 3
      }
    ];

    const { error: stepsError } = await supabase
      .from('workflow_steps')
      .insert(stepsToInsert);

    if (stepsError) {
      console.error('Failed to create workflow steps', stepsError);
      // We don't fail the agent creation, but the workflow might be empty. 
    }

    // Return the agent, but include the workflow ID so frontend can redirect to execution
    res.status(201).json({ ...agent, workflow_id: workflow.id });
  } catch (err) {
    next(err);
  }
};

const updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const { data: agent, error } = await supabase
      .from('agents')
      .update({ name, description })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json(agent);
  } catch (err) {
    next(err);
  }
};

const deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent
};
