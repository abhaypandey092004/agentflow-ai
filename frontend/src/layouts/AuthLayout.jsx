import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-transparent">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent glow-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 blur-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] translate-x-1/2 translate-y-1/2 rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card rounded-[2.5rem] p-10 md:p-14 border-white/10 shadow-2xl overflow-hidden">
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-black text-gradient tracking-tighter mb-2"
              >
                AgentFlow AI
              </motion.h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">The Future of Autonomous Workflows</p>
            </div>
            <Outlet />
          </div>
          
          {/* Subtle background glow inside the card */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary-500/5 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/5 blur-3xl rounded-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
