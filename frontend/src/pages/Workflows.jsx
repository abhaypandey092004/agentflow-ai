 import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { GitMerge, Plus, Play, Trash2, Edit2, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import NewWorkflowModal from '../components/NewWorkflowModal';
import toast from 'react-hot-toast';

const Workflows = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { workflows, loading, fetchWorkflows, removeWorkflow } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Fetch workflows
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // ✅ AUTO OPEN MODAL (Dashboard → Workflows flow)
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get('createAgent') === 'true') {
      setIsModalOpen(true);
    }
  }, [location.search]);

  const isInitialLoading = loading.workflows && workflows.length === 0;

  // ✅ DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workflow?')) return;

    try {
      await api.delete(`/workflows/${id}`);
      removeWorkflow(id);
      toast.success('Workflow deleted');
    } catch (err) {
      console.error(err);
      toast.error('Delete failed');
    }
  };

  // ✅ RUN
  const handleRun = async (id) => {
    const t = toast.loading('Running workflow...');

    try {
      const workflow = workflows.find((w) => w.id === id);
      const input = workflow?.description || workflow?.name || "Run workflow";

      const res = await api.post(`/workflows/${id}/run`, { input });
      const executionId = res?.data?.executionId || res?.executionId;

      if (!executionId) throw new Error("Execution failed");

      toast.success('Started', { id: t });
      navigate(`/history/${executionId}`);

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Execution failed', { id: t });
    }
  };

  // ✅ LOADING
  if (isInitialLoading) {
    return <div className="text-white">Loading workflows...</div>;
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-white font-bold">Workflows</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 px-5 py-2 text-white flex items-center gap-2 rounded"
        >
          <Plus size={18} />
          New Workflow
        </button>
      </div>

      {/* Empty State */}
      {workflows.length === 0 ? (
        <div className="text-center text-slate-400 mt-10">
          No workflows yet
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workflows.map((w) => (
            <div key={w.id} className="bg-black p-5 rounded-xl border">

              <h3 className="text-white text-lg font-bold">{w.name}</h3>
              <p className="text-slate-400 text-sm mb-3">
                {w.description || 'No description'}
              </p>

              <div className="text-xs text-slate-500 mb-4 flex items-center gap-2">
                <Bot size={14} />
                {w.agents?.name || 'No agent'}
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleRun(w.id)} className="text-green-400">
                  <Play size={16} />
                </button>

                <button onClick={() => navigate(`/workflows/builder/${w.id}`)}>
                  <Edit2 size={16} />
                </button>

                <button onClick={() => handleDelete(w.id)} className="text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ MODAL */}
      <NewWorkflowModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default Workflows;