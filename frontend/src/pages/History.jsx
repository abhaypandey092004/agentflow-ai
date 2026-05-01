import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, ArrowRight, ExternalLink } from 'lucide-react';

// Defined outside component to prevent React from treating it as a new type each render
const TableSkeleton = () => (
  <div className="glass-card rounded-3xl overflow-hidden shimmer">
    <div className="bg-white/5 h-14"></div>
    <div className="divide-y divide-white/5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="px-8 py-5 flex justify-between items-center">
          <div className="h-5 w-1/4 bg-white/5 rounded-lg"></div>
          <div className="h-5 w-1/6 bg-white/5 rounded-lg"></div>
          <div className="h-7 w-24 bg-white/5 rounded-full"></div>
          <div className="h-5 w-1/4 bg-white/5 rounded-lg"></div>
          <div className="h-5 w-20 bg-white/5 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
);

const History = () => {
  const executions = useDataStore(state => state.executions);
  const loading = useDataStore(state => state.loading);
  const fetchExecutions = useDataStore(state => state.fetchExecutions);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const isInitialLoading = useMemo(() => loading.executions && executions.length === 0, [loading.executions, executions.length]);

  if (isInitialLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/5 rounded-xl shimmer"></div>
          <div className="h-4 w-96 bg-white/5 rounded-lg shimmer"></div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Execution History</h1>
          <p className="text-slate-400 mt-2 text-lg font-medium">Detailed audit logs and results from your automated workflows.</p>
        </div>
      </div>

      {executions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl glass py-20 text-center"
        >
          <div className="rounded-2xl bg-white/5 p-6 mb-4 text-slate-500">
            <HistoryIcon size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">No Records Yet</h3>
          <p className="text-slate-400 mb-8 max-w-sm font-medium">
            Execute a workflow to see its step-by-step progress and final outputs here.
          </p>
          <Link
            to="/workflows"
            className="flex items-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
          >
            <span>Go to Workflows</span>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/2 text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-black">Workflow</th>
                  <th className="px-8 py-5 font-black">Agent</th>
                  <th className="px-8 py-5 font-black text-center">Status</th>
                  <th className="px-8 py-5 font-black">Started</th>
                  <th className="px-8 py-5 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(executions || []).map((execution, index) => (
                  <motion.tr 
                    key={execution.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-white/2 transition-colors cursor-default"
                  >
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-100 group-hover:text-primary-400 transition-colors">
                        {execution.workflows?.name || 'Unknown Pipeline'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                        {execution.workflows?.agents?.name || '-'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tight ${
                        execution.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        execution.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        execution.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse' :
                        'bg-slate-500/10 text-slate-500 border border-white/5'
                      }`}>
                        {execution.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center text-sm text-slate-500 font-medium">
                        <Clock size={14} className="mr-2 opacity-50" />
                        {new Date(execution.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        to={`/history/${execution.id}`}
                        className="inline-flex items-center space-x-2 text-sm font-black text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default History;
