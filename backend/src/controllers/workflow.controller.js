const supabase = require('../config/supabase');

const getAllWorkflows = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: workflows, error, count } = await supabase
      .from('workflows')
      .select('*, agents(name)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    res.json({
      data: workflows,
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

const getWorkflowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Fetch workflow with its steps
    const { data: workflow, error } = await supabase
      .from('workflows')
      .select(`
        *,
        agents(name),
        workflow_steps(*)
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    
    // Sort steps by order_number
    if (workflow.workflow_steps) {
      workflow.workflow_steps.sort((a, b) => a.order_number - b.order_number);
    }

    res.json(workflow);
  } catch (err) {
    next(err);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const { agent_id, name, description, steps } = req.body;
    
    // Verify agent belongs to user
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agent_id)
      .eq('user_id', req.user.id)
      .single();
      
    if (agentError || !agent) {
      return res.status(400).json({ error: 'Invalid agent ID or agent does not belong to user' });
    }

    // Insert workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: req.user.id,
        agent_id,
        name,
        description
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    // Insert steps
    if (steps && steps.length > 0) {
      const stepsToInsert = steps.map(step => ({
        workflow_id: workflow.id,
        name: step.name,
        type: step.type,
        prompt: step.prompt,
        model: step.model,
        order_number: step.order_number
      }));
      
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);
        
      if (stepsError) {
        // Rollback workflow creation if steps fail
        await supabase.from('workflows').delete().eq('id', workflow.id);
        throw stepsError;
      }
    }

    res.status(201).json(workflow);
  } catch (err) {
    next(err);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, steps } = req.body;
    
    // Check if workflow exists and belongs to user
    const { data: existingWorkflow, error: checkError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();
      
    if (checkError || !existingWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Update workflow
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', id);
        
      if (updateError) throw updateError;
    }

    // Update steps if provided
    if (steps) {
      // First delete existing steps
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', id);
        
      if (deleteError) throw deleteError;
      
      // Then insert new steps
      if (steps.length > 0) {
        const stepsToInsert = steps.map(step => ({
          workflow_id: id,
          name: step.name,
          type: step.type,
          prompt: step.prompt,
          model: step.model,
          order_number: step.order_number
        }));
        
        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsToInsert);
          
        if (stepsError) throw stepsError;
      }
    }

    res.json({ message: 'Workflow updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('workflows')
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
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
};

