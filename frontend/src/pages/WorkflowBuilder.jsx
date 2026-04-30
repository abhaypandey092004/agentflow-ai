import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { motion, Reorder } from 'framer-motion';
import api from '../lib/api';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Settings, Sparkles } from 'lucide-react';

const STEP_TYPES = [
  { value: 'research', label: 'Research' },
  { value: 'summarize', label: 'Summarize' },
  { value: 'generate', label: 'Generate Content' },
  { value: 'rewrite', label: 'Rewrite/Edit' },
  { value: 'extract', label: 'Extract Data' },
  { value: 'custom', label: 'Custom Prompt' }
];

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlAgentId = searchParams.get('agentId');
  const isEditing = Boolean(id);
  const initialData = location.state || {};

  const { agents, fetchAgents } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [workflow, setWorkflow] = useState({
    name: initialData.templateName || '',
    description: '',
    agent_id: urlAgentId || '',
    steps: [
      { 
        name: 'Initial Step', 
        type: 'custom', 
        prompt: initialData.initialPrompt || '', 
        model: 'gpt-4o-mini', 
        order_number: 1 
      }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await fetchAgents();

        if (isEditing) {
          const { data: workflowData } = await api.get(`/workflows/${id}`);
          setWorkflow({
            name: workflowData.name,
            description: workflowData.description || '',
            agent_id: workflowData.agent_id,
            steps: workflowData.workflow_steps || []
          });
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load workflow data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, fetchAgents]);

  useEffect(() => {
    if (!isEditing && agents.length > 0 && !workflow.agent_id) {
      setWorkflow(prev => ({ ...prev, agent_id: agents[0].id }));
    }
  }, [agents, isEditing, workflow.agent_id]);

  const selectedAgent = agents.find(a => a.id === workflow.agent_id);

  const handleStepChange = (index, field, value) => {
    const newSteps = [...workflow.steps];
    newSteps[index][field] = value;
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const handleAddStep = () => {
    setWorkflow({
      ...workflow,
      steps: [
        ...workflow.steps,
        {
          name: `Step ${workflow.steps.length + 1}`,
          type: 'custom',
          prompt: '',
          model: 'gpt-4o-mini',
          order_number: workflow.steps.length + 1
        }
      ]
    });
  };

  const handleRemoveStep = (index) => {
    const newSteps = workflow.steps.filter((_, i) => i !== index);
    newSteps.forEach((step, i) => {
      step.order_number = i + 1;
    });
    setWorkflow({ ...workflow, steps: newSteps });
  };

  const handleSave = async () => {
    if (!workflow.name || !workflow.agent_id) {
      setError('Workflow Name and Agent are required.');
      return;
    }

    if (workflow.steps.length === 0) {
      setError('At least one step is required.');
      return;
    }

    const invalidStep = workflow.steps.find(s => !s.name || !s.prompt);
    if (invalidStep) {
      setError('All steps must have a name and a prompt.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing) {
        await api.put(`/workflows/${id}`, workflow);
      } else {
        await api.post('/workflows', workflow);
      }
      navigate('/workflows');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-white/5 rounded-lg shimmer"></div>
              <div className="h-4 w-64 bg-white/5 rounded-lg shimmer"></div>
            </div>
          </div>
          <div className="h-12 w-32 bg-white/5 rounded-xl shimmer"></div>
        </div>
        <div className="glass-card rounded-3xl h-64 shimmer"></div>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-white/5 rounded-lg shimmer"></div>
          <div className="h-64 glass-card rounded-3xl shimmer"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {selectedAgent && !isEditing && urlAgentId && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary-500/10 border border-primary-500/20 p-4 flex items-center space-x-3 text-primary-400"
        >
          <Sparkles size={20} />
          <span className="font-bold text-sm">Building workflow for: {selectedAgent.name}</span>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/workflows')}
            className="p-3 rounded-xl glass text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {isEditing ? 'Edit Pipeline' : 'Architect Workflow'}
            </h1>
            <p className="text-slate-400 mt-1 text-lg font-medium">Define the execution logic for your AI agents.</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
        >
          {saving ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Save size={20} />
          )}
          <span>{saving ? 'Synchronizing...' : 'Save Workflow'}</span>
        </motion.button>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400 border border-red-500/20"
        >
          {error}
        </motion.div>
      )}

      {/* Main Workflow Config */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 space-y-8"
      >
        <div className="flex items-center space-x-3 pb-6 border-b border-white/5">
          <div className="rounded-xl bg-primary-500/10 p-2">
            <Settings size={24} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-black text-white">Global Configuration</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Workflow Name</label>
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
                className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3.5 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all font-bold"
                placeholder="Pipeline Name"
              />
            </div>
            {!urlAgentId && (
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">AI Architect</label>
                <select
                  value={workflow.agent_id}
                  onChange={(e) => setWorkflow({ ...workflow, agent_id: e.target.value })}
                  className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3.5 text-white focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all appearance-none font-bold cursor-pointer"
                >
                  <option value="" disabled>Select an agent...</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="group">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Context Description</label>
            <textarea
              value={workflow.description}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
              rows={5}
              className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3.5 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all font-bold resize-none"
              placeholder="What is the objective of this pipeline?"
            />
          </div>
        </div>
      </motion.div>

      {/* Steps Builder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400 text-sm font-black mr-3">
              {workflow.steps.length}
            </div>
            Pipeline Topology
          </h2>
        </div>
        
        <div className="space-y-4">
          {workflow.steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-3xl glass-card p-8 transition-all hover:border-white/20"
            >
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-12 w-6 flex flex-col items-center justify-center space-y-1 glass rounded-lg text-slate-500">
                <GripVertical size={16} />
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-sm font-black text-slate-400">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg">
                      {step.name || `Step ${index + 1}`}
                    </h4>
                    {index > 0 && (
                      <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary-500 mt-1">
                        <Sparkles size={10} className="mr-1" />
                        Pipes output from Step {index}
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => handleRemoveStep(index)}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="col-span-2 group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Operation Name</label>
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3 text-sm text-white focus:border-primary-500/50 focus:outline-none transition-all font-bold"
                    placeholder="e.g. Analysis Phase"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Intelligence Type</label>
                  <select
                    value={step.type}
                    onChange={(e) => handleStepChange(index, 'type', e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3 text-sm text-white focus:border-primary-500/50 focus:outline-none appearance-none font-bold cursor-pointer"
                  >
                    {STEP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Autonomous Instructions</label>
                <textarea
                  value={step.prompt}
                  onChange={(e) => handleStepChange(index, 'prompt', e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-sm text-white placeholder-slate-700 focus:border-primary-500/50 focus:outline-none font-mono transition-all leading-relaxed"
                  placeholder={`Define the logic for this operation...\n\nPro Tip: Use {{input}} to reference upstream data.`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleAddStep}
          className="w-full py-8 glass border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-3 text-slate-500 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group"
        >
          <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-primary-500/10 transition-colors">
            <Plus size={24} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Append Neural Step</span>
        </motion.button>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
