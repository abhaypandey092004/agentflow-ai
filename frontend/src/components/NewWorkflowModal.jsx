import React, { useState, useEffect } from 'react';
import { X, GitMerge, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import api from '../lib/api';

const NewWorkflowModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { agents, fetchAgents, addAgent } = useDataStore();

  const [mode, setMode] = useState('select');
  const [selectedAgentId, setSelectedAgentId] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset + fetch agents
  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      setMode('select');
      setSelectedAgentId('');
      setName('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let agentId = '';

      // Select existing agent
      if (mode === 'select') {
        if (!selectedAgentId) {
          throw new Error('Please select an agent');
        }
        agentId = selectedAgentId;
      }

      // Create new agent
      if (mode === 'create') {
        if (!name.trim()) {
          throw new Error('Agent name is required');
        }

        const { data } = await api.post('/agents', {
          name,
          description
        });

        addAgent(data);
        agentId = data.id;
      }

      // Close modal
      onClose();

      // Redirect to builder with agent
      navigate(`/workflows/builder?agentId=${agentId}`);

    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg glass-card rounded-3xl p-6 border border-white/10"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GitMerge size={20} /> New Workflow
              </h2>
              <button onClick={onClose}>
                <X />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 text-red-400 text-sm">{error}</div>
            )}

            {/* Mode Toggle */}
            <div className="flex mb-6">
              <button
                className={`flex-1 p-2 ${mode === 'select' ? 'bg-blue-500' : ''}`}
                onClick={() => setMode('select')}
              >
                Select Agent
              </button>
              <button
                className={`flex-1 p-2 ${mode === 'create' ? 'bg-blue-500' : ''}`}
                onClick={() => setMode('create')}
              >
                Create Agent
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Select Mode */}
              {mode === 'select' && (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full p-3 mb-4 bg-black text-white border"
                >
                  <option value="">Select Agent</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Create Mode */}
              {mode === 'create' && (
                <>
                  <input
                    type="text"
                    placeholder="Agent Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 mb-3 bg-black text-white border"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 mb-3 bg-black text-white border"
                  />
                </>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 p-3 text-white flex justify-center items-center gap-2"
              >
                {loading ? 'Loading...' : 'Continue'}
                <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewWorkflowModal;