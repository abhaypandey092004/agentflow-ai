import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useDataStore } from '../store/useDataStore';
import { motion } from 'framer-motion';
import { Activity, Bot, GitMerge, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (isNaN(end)) return;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

const StatSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 shimmer">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-white/5 rounded"></div>
        <div className="h-8 w-12 bg-white/5 rounded"></div>
      </div>
      <div className="h-12 w-12 bg-white/5 rounded-2xl"></div>
    </div>
  </div>
);

const ExecutionSkeleton = () => (
  <div className="flex items-center justify-between p-6 shimmer">
    <div className="space-y-2">
      <div className="h-5 w-48 bg-white/5 rounded"></div>
      <div className="h-4 w-32 bg-white/5 rounded"></div>
    </div>
    <div className="h-6 w-20 bg-white/5 rounded-full"></div>
  </div>
);

const Dashboard = () => {
  const profile = useAuthStore(state => state.profile);
  
  // Use selectors for stability
  const stats = useDataStore(state => state.stats);
  const executions = useDataStore(state => state.executions);
  const loading = useDataStore(state => state.loading);
  const fetchDashboardData = useDataStore(state => state.fetchDashboardData);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoize derived data — ALL hooks must come before any conditional return
  const recentExecutions = React.useMemo(() => executions.slice(0, 5), [executions]);
  const isInitialLoading = React.useMemo(() => loading.dashboard && executions.length === 0, [loading.dashboard, executions.length]);
  const statCards = React.useMemo(() => [
    { name: 'Active Agents', value: stats.agents, icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Workflows', value: stats.workflows, icon: GitMerge, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { name: 'Executions', value: stats.executions, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ], [stats.agents, stats.workflows, stats.executions]);

  if (isInitialLoading) {
    return (
      <div className="space-y-10">
        <div className="h-12 w-64 bg-white/5 rounded-xl shimmer"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="h-14 bg-white/5 shimmer"></div>
          <div className="divide-y divide-white/5">
            <ExecutionSkeleton />
            <ExecutionSkeleton />
            <ExecutionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            Welcome back, <span className="text-gradient">{profile?.name?.split(' ')[0] || 'User'}</span>
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg">Here's what's happening with your AI agents today.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card group relative overflow-hidden rounded-2xl p-6"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">{stat.name}</p>
                <div className="mt-2 text-4xl font-black text-white">
                  <AnimatedNumber value={stat.value} />
                </div>
              </div>
              <div className={`rounded-2xl ${stat.bg} p-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon className={`h-8 w-8 ${stat.color} glow-primary`} />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/2 blur-2xl" />
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-primary-500/10 p-2">
              <Clock className="h-5 w-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-black text-white">Recent Executions</h2>
          </div>
          <Link to="/history" className="group flex items-center space-x-2 text-sm font-bold text-primary-400 hover:text-primary-300">
            <span>View all</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/2 text-xs font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-8 py-4">Workflow</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentExecutions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center">
                    <p className="text-slate-500 font-medium italic">No executions found yet.</p>
                  </td>
                </tr>
              ) : (
                recentExecutions.map((execution) => (
                  <tr key={execution.id} className="group hover:bg-white/2 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-100 group-hover:text-primary-400 transition-colors">
                        {execution.workflows?.name || 'Unknown Workflow'}
                      </p>
                      <p className="text-xs text-slate-500">{execution.workflows?.agents?.name || 'Unknown Agent'}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-tight ${
                        execution.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        execution.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-primary-500/10 text-primary-400 border border-primary-500/20 animate-pulse'
                      }`}>
                        {execution.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-sm text-slate-500 font-medium">
                      {new Date(execution.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
