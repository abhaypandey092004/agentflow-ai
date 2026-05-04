// const supabase = require('../config/supabase');

// const getAllWorkflows = async (req, res, next) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const from = (page - 1) * limit;
//     const to = from + limit - 1;

//     const { data, error, count } = await supabase
//       .from('workflows')
//       .select('*, agents(name)', { count: 'exact' })
//       .eq('user_id', req.user.id)
//       .order('created_at', { ascending: false })
//       .range(from, to);

//     if (error) throw error;

//     res.json({
//       data: data || [],
//       pagination: {
//         page,
//         limit,
//         total: count || 0,
//         pages: Math.ceil((count || 0) / limit),
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// const getWorkflowById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const { data: workflow, error } = await supabase
//       .from('workflows')
//       .select(`
//         *,
//         agents(name),
//         workflow_steps(*)
//       `)
//       .eq('id', id)
//       .eq('user_id', req.user.id)
//       .single();

//     if (error && error.code !== 'PGRST116') throw error;

//     if (!workflow) {
//       return res.status(404).json({ error: 'Workflow not found' });
//     }

//     workflow.workflow_steps = (workflow.workflow_steps || []).sort(
//       (a, b) => (a.order_number || 0) - (b.order_number || 0)
//     );

//     res.json(workflow);
//   } catch (err) {
//     next(err);
//   }
// };

// const createWorkflow = async (req, res, next) => {
//   try {
//     const { agent_id, name, description = '', steps = [] } = req.body;

//     if (!agent_id || !name) {
//       return res.status(400).json({
//         error: 'agent_id and name are required',
//       });
//     }

//     const { data: agent, error: agentError } = await supabase
//       .from('agents')
//       .select('id')
//       .eq('id', agent_id)
//       .eq('user_id', req.user.id)
//       .single();

//     if (agentError || !agent) {
//       return res.status(400).json({
//         error: 'Invalid agent ID or agent does not belong to user',
//       });
//     }

//     const { data: workflow, error: workflowError } = await supabase
//       .from('workflows')
//       .insert({
//         user_id: req.user.id,
//         agent_id,
//         name,
//         description,
//       })
//       .select()
//       .single();

//     if (workflowError) throw workflowError;

//     if (Array.isArray(steps) && steps.length > 0) {
//       const stepsToInsert = steps.map((step, index) => ({
//         workflow_id: workflow.id,
//         name: step.name || `Step ${index + 1}`,
//         type: step.type || 'generate',
//         prompt: step.prompt || '',
//         model: step.model || 'openai/gpt-4o-mini',
//         order_number: step.order_number ?? index + 1,
//       }));

//       const { error: stepsError } = await supabase
//         .from('workflow_steps')
//         .insert(stepsToInsert);

//       if (stepsError) {
//         await supabase.from('workflows').delete().eq('id', workflow.id);
//         throw stepsError;
//       }
//     }

//     const { data: createdWorkflow } = await supabase
//       .from('workflows')
//       .select(`
//         *,
//         agents(name),
//         workflow_steps(*)
//       `)
//       .eq('id', workflow.id)
//       .single();

//     res.status(201).json(createdWorkflow || workflow);
//   } catch (err) {
//     next(err);
//   }
// };

// const updateWorkflow = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, description, steps } = req.body;

//     const { data: existingWorkflow, error: checkError } = await supabase
//       .from('workflows')
//       .select('id')
//       .eq('id', id)
//       .eq('user_id', req.user.id)
//       .single();

//     if (checkError || !existingWorkflow) {
//       return res.status(404).json({ error: 'Workflow not found' });
//     }

//     const updateData = {};

//     if (name !== undefined) updateData.name = name;
//     if (description !== undefined) updateData.description = description;

//     if (Object.keys(updateData).length > 0) {
//       const { error: updateError } = await supabase
//         .from('workflows')
//         .update(updateData)
//         .eq('id', id)
//         .eq('user_id', req.user.id);

//       if (updateError) throw updateError;
//     }

//     if (Array.isArray(steps)) {
//       const { error: deleteError } = await supabase
//         .from('workflow_steps')
//         .delete()
//         .eq('workflow_id', id);

//       if (deleteError) throw deleteError;

//       if (steps.length > 0) {
//         const stepsToInsert = steps.map((step, index) => ({
//           workflow_id: id,
//           name: step.name || `Step ${index + 1}`,
//           type: step.type || 'generate',
//           prompt: step.prompt || '',
//           model: step.model || 'openai/gpt-4o-mini',
//           order_number: step.order_number ?? index + 1,
//         }));

//         const { error: stepsError } = await supabase
//           .from('workflow_steps')
//           .insert(stepsToInsert);

//         if (stepsError) throw stepsError;
//       }
//     }

//     const { data: updatedWorkflow, error: fetchError } = await supabase
//       .from('workflows')
//       .select(`
//         *,
//         agents(name),
//         workflow_steps(*)
//       `)
//       .eq('id', id)
//       .eq('user_id', req.user.id)
//       .single();

//     if (fetchError) throw fetchError;

//     updatedWorkflow.workflow_steps = (updatedWorkflow.workflow_steps || []).sort(
//       (a, b) => (a.order_number || 0) - (b.order_number || 0)
//     );

//     res.json(updatedWorkflow);
//   } catch (err) {
//     next(err);
//   }
// };

// const deleteWorkflow = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const { data: existingWorkflow, error: checkError } = await supabase
//       .from('workflows')
//       .select('id')
//       .eq('id', id)
//       .eq('user_id', req.user.id)
//       .single();

//     if (checkError || !existingWorkflow) {
//       return res.status(404).json({ error: 'Workflow not found' });
//     }

//     await supabase.from('workflow_steps').delete().eq('workflow_id', id);

//     const { error } = await supabase
//       .from('workflows')
//       .delete()
//       .eq('id', id)
//       .eq('user_id', req.user.id);

//     if (error) throw error;

//     res.json({ message: 'Workflow deleted successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// module.exports = {
//   getAllWorkflows,
//   getWorkflowById,
//   createWorkflow,
//   updateWorkflow,
//   deleteWorkflow,
// };

const supabase = require('../config/supabase');

const getAllWorkflows = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('workflows')
      .select('*, agents(name)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getWorkflowById = async (req, res, next) => {
  try {
    const { id } = req.params;

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

    workflow.workflow_steps = (workflow.workflow_steps || []).sort(
      (a, b) => (a.order_number || 0) - (b.order_number || 0)
    );

    res.json(workflow);
  } catch (err) {
    next(err);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const { agent_id, name, description = '', steps = [] } = req.body;

    if (!agent_id || !name) {
      return res.status(400).json({
        error: 'agent_id and name are required',
      });
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', agent_id)
      .eq('user_id', req.user.id)
      .single();

    if (agentError || !agent) {
      return res.status(400).json({
        error: 'Invalid agent ID or agent does not belong to user',
      });
    }

    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: req.user.id,
        agent_id,
        name,
        description,
      })
      .select()
      .single();

    if (workflowError) throw workflowError;

    if (Array.isArray(steps) && steps.length > 0) {
      const stepsToInsert = steps.map((step, index) => ({
        workflow_id: workflow.id,
        name: step.name || `Step ${index + 1}`,
        type: step.type || 'generate',
        prompt: step.prompt || '',
        model: step.model || 'openai/gpt-4o-mini',
        order_number: step.order_number ?? index + 1,
      }));

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);

      if (stepsError) {
        await supabase.from('workflows').delete().eq('id', workflow.id);
        throw stepsError;
      }
    }

    const { data: createdWorkflow } = await supabase
      .from('workflows')
      .select(`
        *,
        agents(name),
        workflow_steps(*)
      `)
      .eq('id', workflow.id)
      .single();

    res.status(201).json(createdWorkflow || workflow);
  } catch (err) {
    next(err);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, steps } = req.body;

    const { data: existingWorkflow, error: checkError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (updateError) throw updateError;
    }

    if (Array.isArray(steps)) {
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', id);

      if (deleteError) throw deleteError;

      if (steps.length > 0) {
        const stepsToInsert = steps.map((step, index) => ({
          workflow_id: id,
          name: step.name || `Step ${index + 1}`,
          type: step.type || 'generate',
          prompt: step.prompt || '',
          model: step.model || 'openai/gpt-4o-mini',
          order_number: step.order_number ?? index + 1,
        }));

        const { error: stepsError } = await supabase
          .from('workflow_steps')
          .insert(stepsToInsert);

        if (stepsError) throw stepsError;
      }
    }

    const { data: updatedWorkflow, error: fetchError } = await supabase
      .from('workflows')
      .select(`
        *,
        agents(name),
        workflow_steps(*)
      `)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError) throw fetchError;

    updatedWorkflow.workflow_steps = (updatedWorkflow.workflow_steps || []).sort(
      (a, b) => (a.order_number || 0) - (b.order_number || 0)
    );

    res.json(updatedWorkflow);
  } catch (err) {
    next(err);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existingWorkflow, error: checkError } = await supabase
      .from('workflows')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (checkError || !existingWorkflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    await supabase.from('workflow_steps').delete().eq('workflow_id', id);

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Workflow deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
};