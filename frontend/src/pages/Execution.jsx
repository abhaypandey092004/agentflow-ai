import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { getSocket, initSocket, disconnectSocket } from '../lib/socket';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle, 
  Download, 
  FileText, 
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react';

const Execution = () => {
  const { id } = useParams();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const executionRef = React.useRef(execution);
  useEffect(() => {
    executionRef.current = execution;
  }, [execution]);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const { data } = await api.get(`/executions/${id}`);
        setExecution(data);
      } catch (err) {
        console.error('Failed to fetch execution:', err);
        setError('Failed to load execution details.');
      } finally {
        setLoading(false);
      }
    };

    const setup = async () => {
      await initSocket();
      fetchExecution();
    };
    setup();
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleWorkflowStarted = (data) => {
      if (data.executionId === id) {
        setExecution(prev => ({ ...prev, status: 'processing' }));
      }
    };

    const handleStepStarted = (data) => {
      if (data.executionId === id) {
        setExecution(prev => {
          if (!prev) return prev;
          const newSteps = [...(prev.step_executions || [])];
          const stepIndex = newSteps.findIndex(s => s.id === data.stepExecutionId);
          if (stepIndex !== -1) {
            // Step already in local state — just update its status and prompt
            newSteps[stepIndex] = { 
              ...newSteps[stepIndex], 
              status: 'processing',
              processedPrompt: data.processedPrompt 
            };
          } else {
            // Step was just created in DB; append a placeholder so the UI shows it
            newSteps.push({
              id: data.stepExecutionId,
              status: 'processing',
              processedPrompt: data.processedPrompt,
              workflow_steps: { name: 'Processing...', type: '' },
            });
          }
          return { ...prev, step_executions: newSteps };
        });
      }
    };

    const handleStepCompleted = (data) => {
      if (data.executionId === id) {
        setExecution(prev => {
          if (!prev) return prev;
          const newSteps = [...prev.step_executions];
          const stepIndex = newSteps.findIndex(s => s.id === data.stepExecutionId);
          if (stepIndex !== -1) {
            newSteps[stepIndex] = { ...newSteps[stepIndex], status: 'completed', result: data.result };
          }
          return { ...prev, step_executions: newSteps };
        });
      }
    };

    const handleStepFailed = (data) => {
      if (data.executionId === id) {
        setExecution(prev => {
          if (!prev) return prev;
          const newSteps = [...prev.step_executions];
          const stepIndex = newSteps.findIndex(s => s.id === data.stepExecutionId);
          if (stepIndex !== -1) {
            newSteps[stepIndex] = { ...newSteps[stepIndex], status: 'failed', error: data.error };
          }
          return { ...prev, step_executions: newSteps };
        });
      }
    };

    const handleWorkflowCompleted = (data) => {
      if (data.executionId === id) {
        setExecution(prev => ({ ...prev, status: 'completed', result: data.result }));
      }
    };

    const handleWorkflowFailed = (data) => {
      if (data.executionId === id) {
        setExecution(prev => ({ ...prev, status: 'failed', result: null, errorMessage: data.error }));
      }
    };

    socket.on('workflow_started', handleWorkflowStarted);
    socket.on('step_started', handleStepStarted);
    socket.on('step_completed', handleStepCompleted);
    socket.on('step_failed', handleStepFailed);
    socket.on('workflow_completed', handleWorkflowCompleted);
    socket.on('workflow_failed', handleWorkflowFailed);

    return () => {
      socket.off('workflow_started', handleWorkflowStarted);
      socket.off('step_started', handleStepStarted);
      socket.off('step_completed', handleStepCompleted);
      socket.off('step_failed', handleStepFailed);
      socket.off('workflow_completed', handleWorkflowCompleted);
      socket.off('workflow_failed', handleWorkflowFailed);
    };
  }, [id]);

  // ── Polling fallback ────────────────────────────────────────────────────────
  // If socket events are missed (BullMQ delay, socket disconnect, etc.) this
  // re-fetches from the API every 3 s until the execution resolves.
  useEffect(() => {
    const isActive = execution?.status === 'pending' || execution?.status === 'processing';
    if (!isActive) return;

    const startedAt = Date.now();

    const interval = setInterval(async () => {
      // Safety: if stuck for >35 seconds, stop polling and show a timeout UI
      if (Date.now() - startedAt > 35_000) {
        clearInterval(interval);
        setTimedOut(true);
        return;
      }

      try {
        const { data } = await api.get(`/executions/${id}`);
        // Only update if something actually changed to avoid unnecessary re-renders
        if (
          data.status !== executionRef.current?.status ||
          data.result !== executionRef.current?.result ||
          (data.step_executions?.length ?? 0) !== (executionRef.current?.step_executions?.length ?? 0)
        ) {
          setExecution(data);
        }
        // Stop polling once execution has resolved
        if (data.status !== 'pending' && data.status !== 'processing') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('[Polling] Failed to fetch execution:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, execution?.status]);

  const handleExport = async (format) => {
    if (!execution?.result) return;
    setExporting(true);
    try {
      const response = await api.post(
        `/export/${format}`,
        { content: execution.result },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${execution.workflows?.name || 'export'}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Export to ${format} failed`, err);
      alert('Failed to export document');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-white/5 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-white/5 rounded-lg shimmer"></div>
            <div className="h-4 w-64 bg-white/5 rounded-lg shimmer"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass-card h-96 shimmer rounded-3xl"></div>
          <div className="lg:col-span-2 glass-card h-96 shimmer rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-12 text-center rounded-3xl glass border border-white/5">
        <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Neural Link Failed</h2>
        <p className="text-red-400 font-medium">{error || 'The requested execution matrix could not be found.'}</p>
        <Link to="/history" className="mt-8 inline-flex items-center space-x-2 text-primary-400 font-black uppercase tracking-widest hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Records</span>
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="text-emerald-400 glow-primary" size={24} />;
      case 'processing': return <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />;
      case 'failed': return <XCircle className="text-red-400" size={24} />;
      default: return <Circle className="text-slate-700" size={24} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-3 rounded-xl glass text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight truncate">
                {execution.workflows?.name}
              </h1>
              <span className={`inline-flex items-center rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-tight border self-start ${
                execution.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                execution.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                execution.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
                'bg-slate-500/10 text-slate-500 border-white/5'
              }`}>
                {execution.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1 flex items-center font-medium">
              <Clock size={14} className="mr-2 opacity-50" />
              Established: {new Date(execution.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Pipeline */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-8 sticky top-8"
          >
            <h2 className="text-xl font-black text-white mb-8 flex items-center">
              <Zap size={20} className="mr-3 text-primary-400" />
              Neural Pipeline
            </h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-primary-500/20 before:via-primary-500/40 before:to-transparent">
              {execution.step_executions?.map((stepExec, index) => (
                <motion.div 
                  key={stepExec.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start"
                >
                  <div className="absolute left-0 w-6 flex items-center justify-center bg-transparent py-1 z-10">
                    <div className="bg-[#020617] rounded-full p-0.5">
                      {getStatusIcon(stepExec.status)}
                    </div>
                  </div>
                  <div className={`ml-10 w-full rounded-2xl border transition-all duration-500 p-5 ${
                    stepExec.status === 'processing' ? 'bg-primary-500/10 border-primary-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
                    stepExec.status === 'completed' ? 'bg-white/2 border-emerald-500/10' :
                    'bg-white/2 border-white/5 opacity-50'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-black text-white">{stepExec.workflow_steps?.name}</h3>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">
                          {stepExec.workflow_steps?.type}
                        </p>
                        {stepExec.processedPrompt && (
                          <div className="mt-3 p-2 bg-black/40 rounded-lg border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Applied Prompt</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-relaxed">
                              "{stepExec.processedPrompt}"
                            </p>
                          </div>
                        )}
                      </div>
                      {stepExec.status === 'completed' && (
                        <CheckCircle2 size={16} className="text-emerald-400 opacity-50" />
                      )}
                    </div>
                    {stepExec.error && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs font-bold text-red-400 mt-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                      >
                        {stepExec.error}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Final Output */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 min-h-[600px] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
              <h2 className="text-xl font-black text-white flex items-center">
                <Sparkles size={20} className="mr-3 text-purple-400" />
                Synthetic Intelligence Output
              </h2>
              
              <AnimatePresence>
                {execution.status === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex space-x-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExport('pdf')}
                      disabled={exporting}
                      className="flex items-center space-x-2 rounded-xl bg-white/5 border border-white/5 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <FileText size={18} className="text-red-400" />
                      <span>PDF</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExport('docx')}
                      disabled={exporting}
                      className="flex items-center space-x-2 rounded-xl bg-white/5 border border-white/5 px-5 py-2.5 text-sm font-black text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Download size={18} className="text-blue-400" />
                      <span>DOCX</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1">
              {(execution.status === 'processing' || execution.status === 'pending') && !timedOut ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="h-24 w-24 rounded-3xl bg-primary-500/10 border border-primary-500/20 blur-xl absolute"
                    />
                    <div className="relative h-24 w-24 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-white mb-2">Synthesizing Data...</p>
                    <p className="text-slate-500 font-medium animate-pulse">Large Language Models are processing the neural pipeline.</p>
                  </div>
                </div>
              ) : timedOut ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6">
                  <div className="rounded-2xl bg-amber-500/10 p-6">
                    <Clock size={40} className="text-amber-400" />
                  </div>
                  <div className="text-center max-w-lg px-4">
                    <p className="text-xl font-black text-white mb-3">Execution Timed Out</p>
                    <p className="text-slate-400 font-medium mb-6">The workflow has been running longer than expected. It may still be processing in the background.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 rounded-xl bg-primary-500/20 border border-primary-500/30 text-primary-400 font-black text-sm hover:bg-primary-500/30 transition-all"
                    >
                      Refresh Page
                    </motion.button>
                  </div>
                </div>
              ) : execution.result ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert max-w-none"
                >
                  <div className="flex items-center space-x-2 mb-4 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 w-fit">
                    <Sparkles size={14} className="text-primary-400" />
                    <span className="text-xs font-black text-primary-400 uppercase tracking-widest">AI Generated Output</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[15px] text-slate-300 leading-relaxed bg-black/20 p-8 rounded-3xl border border-white/5">
                    {execution.result}
                  </pre>
                </motion.div>
              ) : execution.status === 'failed' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6"
                >
                  <div className="rounded-2xl bg-red-500/10 p-6">
                    <XCircle size={40} className="text-red-400" />
                  </div>
                  <div className="text-center max-w-lg px-4">
                    <p className="text-xl font-black text-white mb-3">Execution Failed</p>
                    {execution.errorMessage ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-left">
                        <p className="text-sm font-bold text-red-300 leading-relaxed">{execution.errorMessage}</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 font-medium">No output was generated. Check the step errors in the pipeline for details.</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-600">
                  <div className="rounded-2xl bg-white/5 p-6 mb-4">
                    <Circle size={40} className="opacity-20" />
                  </div>
                  <p className="text-lg font-bold">Neural link active. Waiting for signal...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Execution;
