import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/useDataStore';
import { Bot, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AgentModal from '../components/AgentModal';
import api from '../lib/api';

const Agents = () => {
  const { agents, loading, fetchAgents, addAgent, updateAgent, removeAgent } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const AgentSkeleton = () => (
    <div className="glass-card flex flex-col rounded-2xl p-6 shimmer">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
          <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
        </div>
      </div>
      <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-2"></div>
      <div className="h-4 w-full bg-white/5 rounded-lg mb-1"></div>
      <div className="h-4 w-5/6 bg-white/5 rounded-lg"></div>
    </div>
  );

  const handleCreate = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent? It will also delete all associated workflows.')) return;
    
    try {
      await api.delete(`/agents/${id}`);
      removeAgent(id);
    } catch (err) {
      console.error('Failed to delete agent:', err);
    }
  };

  const handleSave = (savedAgent) => {
    if (editingAgent) {
      updateAgent(savedAgent);
    } else {
      addAgent(savedAgent);
    }
  };

  const isInitialLoading = loading.agents && agents.length === 0;

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-white/5 rounded-xl shimmer"></div>
            <div className="h-4 w-64 bg-white/5 rounded-lg shimmer"></div>
          </div>
          <div className="h-12 w-40 bg-white/5 rounded-xl shimmer"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AgentSkeleton />
          <AgentSkeleton />
          <AgentSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">AI Agents</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Power your workflows with custom-trained AI entities.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center justify-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>New Agent</span>
        </motion.button>
      </div>

      {agents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl glass py-20 text-center"
        >
          <div className="rounded-2xl bg-white/5 p-6 mb-4">
            <Bot size={48} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Deployment Ready</h3>
          <p className="text-slate-400 mb-8 max-w-sm font-medium">
            Deploy your first AI agent to start automating complex multi-step pipelines.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="flex items-center space-x-2 rounded-xl bg-white/10 border border-white/10 px-6 py-3 text-sm font-black text-primary-400 hover:bg-white/20 transition-all"
          >
            <Plus size={20} />
            <span>Create Agent</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <motion.div 
              key={agent.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group glass-card relative flex flex-col rounded-3xl p-6 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="rounded-2xl bg-blue-500/10 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Bot size={28} className="text-blue-400 glow-primary" />
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEdit(agent)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(agent.id)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-primary-400 transition-colors">
                {agent.name}
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed flex-1">
                {agent.description || 'Custom autonomous agent configured for specialized tasks and efficient workflow processing.'}
              </p>
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  ID: {agent.id.slice(0, 8)}...
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {new Date(agent.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-blue-500/2 blur-2xl group-hover:bg-blue-500/5 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      )}

      <AgentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agent={editingAgent}
        onSave={handleSave}
      />
    </div>
  );
};

export default Agents;
