import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { motion } from 'framer-motion';
import { GitMerge, Plus, Edit2, Trash2, Play, ChevronRight } from 'lucide-react';
import api from '../lib/api';

// Defined outside component to prevent React from treating it as a new type each render
const WorkflowSkeleton = () => (
  <div className="glass-card flex flex-col rounded-3xl p-6 shimmer">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
        <div className="space-y-2">
          <div className="h-5 w-32 bg-white/5 rounded-lg"></div>
          <div className="h-3 w-24 bg-white/5 rounded-lg"></div>
        </div>
      </div>
      <div className="h-10 w-20 bg-white/5 rounded-xl"></div>
    </div>
    <div className="h-4 w-full bg-white/5 rounded-lg mb-1"></div>
    <div className="h-4 w-5/6 bg-white/5 rounded-lg"></div>
  </div>
);

const Workflows = () => {
  const { workflows, loading, fetchWorkflows, removeWorkflow } = useDataStore();
  const [runningId, setRunningId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const isInitialLoading = loading.workflows && workflows.length === 0;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    
    try {
      await api.delete(`/workflows/${id}`);
      removeWorkflow(id);
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleRun = async (id) => {
    try {
      setRunningId(id);
      const { data } = await api.post(`/workflows/${id}/run`);
      navigate(`/history/${data.executionId}`);
    } catch (err) {
      console.error('Failed to run workflow:', err);
      alert(err.response?.data?.error || 'Failed to start workflow execution');
    } finally {
      setRunningId(null);
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <WorkflowSkeleton />
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
          <p className="text-slate-400 mt-2 text-lg font-medium">Chain multiple AI steps into powerful autonomous pipelines.</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
          <Link
            to="/workflows/builder"
            className="flex items-center justify-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 w-full sm:w-auto"
          >
            <Plus size={20} />
            <span>New Workflow</span>
          </Link>
        </motion.div>
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
          <h3 className="text-2xl font-black text-white mb-2">Build Your Pipeline</h3>
          <p className="text-slate-400 mb-8 max-w-sm font-medium">
            Define multi-step sequences where each step processes information and passes it to the next.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/workflows/builder"
              className="flex items-center space-x-2 rounded-xl bg-white/10 border border-white/10 px-6 py-3 text-sm font-black text-primary-400 hover:bg-white/20 transition-all"
            >
              <Plus size={20} />
              <span>Create Workflow</span>
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {workflows.map((workflow, index) => (
            <motion.div 
              key={workflow.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 5 }}
              className="group glass-card relative flex flex-col rounded-3xl p-6 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="rounded-2xl bg-purple-500/10 p-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <GitMerge size={28} className="text-purple-400 glow-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-primary-400 transition-colors">
                      {workflow.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                        Agent: {workflow.agents?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRun(workflow.id)}
                    disabled={runningId === workflow.id}
                    className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-black text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {runningId === workflow.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                    ) : (
                      <>
                        <Play size={16} fill="currentColor" />
                        <span>Run</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 font-medium leading-relaxed flex-1">
                {workflow.description || 'Configured automated pipeline using multi-model chaining for specialized task execution.'}
              </p>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex space-x-3">
                  <Link 
                    to={`/workflows/builder/${workflow.id}`}
                    className="flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                  >
                    <Edit2 size={12} />
                    <span>Configure</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(workflow.id)}
                    className="flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
                <Link to={`/workflows/builder/${workflow.id}`} className="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} />
                </Link>
              </div>
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-purple-500/2 blur-2xl group-hover:bg-purple-500/5 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workflows;
