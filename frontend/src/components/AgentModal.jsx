import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const AgentModal = ({ isOpen, onClose, agent, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setError('');
  }, [agent, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (agent) {
        const { data } = await api.put(`/agents/${agent.id}`, { name, description });
        onSave(data);
      } else {
        const { data } = await api.post('/agents', { name, description });
        onSave(data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Neural link failed. Verify agent configuration.');
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
            className="w-full max-w-lg glass-card rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-xl bg-primary-500/10 p-2 text-primary-400">
                  <Bot size={24} />
                </div>
                <h2 className="text-2xl font-black text-white">
                  {agent ? 'Edit Agent' : 'Create Agent'}
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

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Neural Signature</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none transition-all font-bold"
                    placeholder="e.g. Cognitive Engine Alpha"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-primary-400 transition-colors">Operational Scope</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/5 bg-black/20 px-5 py-4 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none transition-all font-bold resize-none"
                    placeholder="Define the primary mission of this autonomous unit..."
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between space-x-4">
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <Sparkles size={12} className="mr-2" />
                  Neural Encryption Active
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-sm font-black text-slate-500 hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : null}
                    <span>{agent ? 'Update Unit' : 'Deploy Agent'}</span>
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentModal;
