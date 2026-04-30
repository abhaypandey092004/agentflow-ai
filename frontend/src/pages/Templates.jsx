import React, { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, CheckCircle2, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Defined outside component to prevent React from treating it as a new type each render
const TemplateSkeleton = () => (
  <div className="glass-card flex flex-col rounded-[2rem] p-8 shimmer">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 bg-white/5 rounded-2xl"></div>
        <div className="space-y-2">
          <div className="h-6 w-40 bg-white/5 rounded-lg"></div>
          <div className="h-4 w-20 bg-white/5 rounded-lg"></div>
        </div>
      </div>
      <div className="h-10 w-24 bg-white/5 rounded-xl"></div>
    </div>
    <div className="h-4 w-full bg-white/5 rounded-lg mb-4"></div>
    <div className="h-4 w-2/3 bg-white/5 rounded-lg mb-8"></div>
    <div className="h-32 bg-white/5 rounded-[1.5rem]"></div>
    <div className="mt-8 h-12 w-full bg-white/5 rounded-xl"></div>
  </div>
);

const Templates = () => {
  const templates = useDataStore(state => state.templates);
  const loading = useDataStore(state => state.loading);
  const fetchTemplates = useDataStore(state => state.fetchTemplates);

  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const isInitialLoading = useMemo(() => loading.templates && templates.length === 0, [loading.templates, templates.length]);

  const handleCopy = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseTemplate = (template) => {
    // Navigate to workflow builder and pass the prompt via state
    navigate('/workflows/builder', { state: { initialPrompt: template.prompt, templateName: template.name } });
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-10">
        <header>
          <div className="h-12 w-64 bg-white/5 rounded-2xl shimmer mb-3"></div>
          <div className="h-6 w-96 bg-white/5 rounded-xl shimmer"></div>
        </header>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <TemplateSkeleton />
          <TemplateSkeleton />
          <TemplateSkeleton />
          <TemplateSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight"
          >
            Neural <span className="text-gradient">Blueprints</span>
          </motion.h1>
          <p className="text-slate-400 mt-3 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
            Pre-optimized prompt architectures for industry-standard autonomous operations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AnimatePresence>
          {templates.map((template, index) => (
            <motion.div 
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group glass-card flex flex-col rounded-[2.5rem] p-8 md:p-10 transition-all duration-500 hover:border-primary-500/30 relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary-500/5 blur-[80px] rounded-full group-hover:bg-primary-500/10 transition-colors duration-500" />
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex items-center space-x-5">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg shadow-orange-500/10">
                    <FileText size={32} className="text-orange-400 glow-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-primary-400 transition-colors duration-300">{template.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Sparkles size={12} className="text-primary-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500/80">{template.type}</p>
                    </div>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(template.id, template.prompt)}
                  className="rounded-2xl bg-white/5 border border-white/5 p-3 text-slate-400 hover:text-white transition-all flex items-center space-x-2 backdrop-blur-md"
                >
                  {copiedId === template.id ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                    <Copy size={20} />
                  )}
                </motion.button>
              </div>
              
              <p className="text-base text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
                {template.description}
              </p>
              
              <div className="flex-1 bg-black/40 rounded-[1.5rem] p-6 font-mono text-sm text-slate-300 whitespace-pre-wrap overflow-y-auto max-h-48 border border-white/5 custom-scrollbar relative z-10 shadow-inner">
                {template.prompt}
              </div>

              <div className="mt-8 relative z-10">
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUseTemplate(template)}
                  className="w-full flex items-center justify-center space-x-3 rounded-[1.25rem] bg-primary-600 px-8 py-5 text-sm font-black text-white hover:bg-primary-500 transition-all shadow-xl shadow-primary-500/20 group/btn"
                >
                  <Zap size={18} fill="currentColor" />
                  <span>Deploy Blueprint</span>
                  <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {templates.length === 0 && !loading.templates && (
        <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[3rem] border-dashed">
          <div className="rounded-[2rem] bg-white/5 p-8 mb-6">
            <Sparkles size={64} className="text-slate-600" />
          </div>
          <h3 className="text-3xl font-black text-white mb-3">No Blueprints Found</h3>
          <p className="text-slate-500 text-lg font-medium">The neural library is currently empty. Initialize seeding process.</p>
        </div>
      )}
    </div>
  );
};

export default Templates;
