import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles, Plus, GitMerge, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import api from '../lib/api';

const NewWorkflowModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { agents, fetchAgents, addAgent } = useDataStore();
  const [mode, setMode] = useState('select'); // 'select' or 'create'
  const [selectedAgentId, setSelectedAgentId] = useState('');
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      setMode('select');
      setSelectedAgentId('');
      setName('');
      setDescription('');
      setError('');
    }
  }, [isOpen, fetchAgents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalAgentId = '';
      
      if (mode === 'select') {
        if (!selectedAgentId) {
          setError('Please select an agent first.');
          setLoading(false);
          return;
        }
        finalAgentId = selectedAgentId;
      } else {
        if (!name) {
          setError('Agent name is required.');
          setLoading(false);
          return;
        }
        const { data } = await api.post('/agents', { name, description });
        addAgent(data);
        finalAgentId = data.id;
      }
      
      onClose();
      navigate(`/workflows/builder?agentId=${finalAgentId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg glass-card rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
                  <GitMerge size={24} />
                </div>
                <h2 className="text-2xl font-black text-white">
                  New Workflow
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400 border border-red-500/20"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex bg-black/40 rounded-2xl p-1 border border-white/5 relative">
                <div 
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 border border-white/10 rounded-xl transition-all duration-300 shadow-lg"
                  style={{ left: mode === 'select' ? '4px' : 'calc(50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className={`flex-1 py-3 text-sm font-black transition-colors relative z-10 ${mode === 'select' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Select Agent
                </button>
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className={`flex-1 py-3 text-sm font-black transition-colors relative z-10 ${mode === 'create' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Create New Agent
                </button>
              </div>

              <div className="min-h-[140px]">
                <AnimatePresence mode="wait">
                  {mode === 'select' ? (
                    <motion.div
                      key="select"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Select AI Architect</label>
                      {agents.length === 0 ? (
                        <div className="text-sm font-medium text-slate-400 text-center py-6 bg-black/20 rounded-2xl border border-white/5">
                          No agents found. Please create one first.
                        </div>
                      ) : (
                        <select
                          value={selectedAgentId}
                          onChange={(e) => setSelectedAgentId(e.target.value)}
                          className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white focus:border-primary-500/50 focus:outline-none appearance-none font-bold cursor-pointer transition-all"
                        >
                          <option value="" disabled>Select an agent to power this workflow...</option>
                          {agents.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Neural Signature (Name)</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none transition-all font-bold"
                          placeholder="e.g. Content Writer Bot"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Operational Scope (Optional)</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-3 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none transition-all font-bold"
                          placeholder="What will this agent do?"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || (mode === 'select' && agents.length === 0)}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3.5 text-sm font-black text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : null}
                  <span>Continue to Builder</span>
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewWorkflowModal;
