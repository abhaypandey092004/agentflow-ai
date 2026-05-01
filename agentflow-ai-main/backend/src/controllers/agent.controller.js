const supabase = require('../config/supabase');

const getAllAgents = async (req, res, next) => {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(agents);
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
    
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        user_id: req.user.id,
        name,
        description
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(agent);
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
