import React, { useState } from 'react';
import { Bot, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AgentRunner = () => {
  const navigate = useNavigate();

  const [agentName, setAgentName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRun = async (e) => {
    e.preventDefault();

    if (!agentName.trim()) {
      toast.error('Agent name is required');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter what you want to ask');
      return;
    }

    setLoading(true);
    setOutput('');

    try {
      const { data } = await api.post('/agents/simple-run', {
        name: agentName,
        prompt,
      });

      setOutput(data.output || 'No output generated');
      toast.success('Output generated');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to generate output');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="glass-card rounded-3xl p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
            <Bot size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Create & Run Agent</h1>
            <p className="text-slate-400 mt-1">
              Simple mode: create an agent, ask anything, get output instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleRun} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              Agent Name
            </label>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Story Writer, Code Helper, Blog Assistant"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
              What do you want?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a short story about a magical robot..."
              rows={7}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-black text-white disabled:opacity-60"
            >
              <Sparkles size={20} />
              {loading ? 'Generating...' : 'Create & Run Agent'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/workflows/builder')}
              className="rounded-2xl border border-white/10 px-8 py-4 font-bold text-slate-300 hover:bg-white/5"
            >
              Advanced Workflow Builder
            </button>
          </div>
        </form>
      </div>

      {output && (
        <div className="glass-card rounded-3xl p-8 border border-white/10">
          <h2 className="text-2xl font-black text-white mb-4">Output</h2>
          <div className="whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-slate-200 leading-relaxed">
            {output}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentRunner;