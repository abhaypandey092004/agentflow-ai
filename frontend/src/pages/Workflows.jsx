import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { GitMerge, Plus, Play, Trash2, Edit2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import NewWorkflowModal from '../components/NewWorkflowModal';
import toast from 'react-hot-toast';

const WorkflowSkeleton = () => (
  <div className="glass-card flex flex-col rounded-3xl p-6 shimmer">
    <div className="flex items-start justify-between mb-4">
      <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-white/5 rounded-lg"></div>
      </div>
    </div>
    <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-2"></div>
    <div className="h-4 w-full bg-white/5 rounded-lg mb-1"></div>
    <div className="h-4 w-5/6 bg-white/5 rounded-lg"></div>
  </div>
);

const Workflows = () => {
  const navigate = useNavigate();
  const { workflows, loading, fetchWorkflows, removeWorkflow } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const isInitialLoading = loading.workflows && workflows.length === 0;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow? All associated executions will be lost.')) return;
    try {
      await api.delete(`/workflows/${id}`);
      removeWorkflow(id);
      toast.success('Workflow deleted');
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      toast.error('Failed to delete workflow');
    }
  };

  const handleRun = async (id) => {
    const t = toast.loading('Initiating neural pipeline...');
    try {
      const workflow = workflows.find((w) => w.id === id);
      const input = workflow?.description || workflow?.name || "Run this workflow";

      const response = await api.post(`/workflows/${id}/run`, { input });
      const executionId = response?.data?.executionId || response?.executionId;

      if (!executionId) throw new Error("Execution ID missing from response");

      toast.success('Workflow execution started', { id: t });
      navigate(`/history/${executionId}`);
    } catch (err) {
      console.error('Workflow execution error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to execute workflow';
      toast.error(errorMessage, { id: t });
    }
  };


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
          <WorkflowSkeleton />
          <WorkflowSkeleton />
          <WorkflowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Workflows</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Design and automate your multi-step AI pipelines.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-black text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>New Workflow</span>
        </motion.button>
      </div>

      {workflows.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl glass py-20 text-center"
        >
          <div className="rounded-2xl bg-white/5 p-6 mb-4">
            <GitMerge size={48} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">No Pipelines Found</h3>
          <p className="text-slate-400 mb-8 max-w-sm font-medium">
            Start building your first autonomous workflow pipeline.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-white/10 border border-white/10 px-6 py-3 text-sm font-black text-purple-400 hover:bg-white/20 transition-all"
          >
            <Plus size={20} />
            <span>Create Workflow</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(workflows || []).map((workflow, index) => (
            <motion.div 
              key={workflow.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group glass-card relative flex flex-col rounded-3xl p-6 transition-all duration-300 border-white/5"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="rounded-2xl bg-purple-500/10 p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <GitMerge size={28} className="text-purple-400 glow-primary" />
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleRun(workflow.id)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                  >
                    <Play size={18} className="fill-current" />
                  </button>
                  <button 
                    onClick={() => navigate(`/workflows/builder/${workflow.id}`)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(workflow.id)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors">
                {workflow.name}
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed flex-1">
                {workflow.description || 'Automated multi-step processing pipeline.'}
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center space-x-2">
                <Bot size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-400">
                  {workflow.agents?.name || 'Unknown Agent'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  ID: {workflow.id.slice(0, 8)}...
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {new Date(workflow.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-purple-500/2 blur-2xl group-hover:bg-purple-500/5 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      )}

      <NewWorkflowModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Workflows;
