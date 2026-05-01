import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signUp(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Neural link could not be established.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">Establish Neural Link</h2>
        <p className="text-slate-500 font-medium mt-1">Join the network of autonomous operators.</p>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400 border border-red-500/20 text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2 group">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary-400 transition-colors">Operator Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full rounded-2xl border border-white/5 bg-black/20 pl-12 pr-5 py-4 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all font-bold"
              placeholder="Full Name"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary-400 transition-colors">Neural Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-black/20 pl-12 pr-5 py-4 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all font-bold"
              placeholder="operator@agentflow.ai"
            />
          </div>
        </div>

        <div className="space-y-2 group">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary-400 transition-colors">Access Key</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-black/20 pl-12 pr-5 py-4 text-white placeholder-slate-600 focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all font-bold"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="relative group flex w-full items-center justify-center space-x-3 rounded-2xl bg-primary-600 px-6 py-4 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 overflow-hidden"
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Initialize Account</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      <div className="text-center pt-4">
        <p className="text-sm font-medium text-slate-500">
          Already Enrolled?{' '}
          <Link to="/login" className="font-black text-primary-400 hover:text-primary-300 transition-colors underline underline-offset-4 decoration-primary-400/30">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
