import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  GitMerge, 
  PlayCircle, 
  Download, 
  ArrowRight,
  PenTool,
  Search,
  FileText,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Dashboard = () => {
  const profile = useAuthStore(state => state.profile);

  const steps = [
    { icon: Bot, title: "1. Create Agent", desc: "Define your custom AI agent with specific instructions and models." },
    { icon: GitMerge, title: "2. Build Workflow", desc: "Chain together multiple steps like research, summarize, and generate." },
    { icon: PlayCircle, title: "3. Run Automation", desc: "Execute the workflow and watch the AI process each step sequentially." },
    { icon: Download, title: "4. Export Output", desc: "Download the final generated content in PDF or DOCX formats." },
  ];

  const useCases = [
    { icon: PenTool, title: "Blog Writing", desc: "Research a topic, outline structure, and generate full SEO-optimized articles.", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Search, title: "Research Assistant", desc: "Gather data, analyze sources, and summarize key findings automatically.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: FileText, title: "Document Summarizer", desc: "Extract key points, entities, and action items from long documents.", color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Sparkles, title: "Content Generator", desc: "Create social media posts, ad copy, and email sequences in seconds.", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-16 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-card border border-white/10 p-8 sm:p-16 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            <span>Welcome, {profile?.name?.split(' ')[0] || 'Creator'}</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
            AgentFlow <span className="text-gradient">AI</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build custom AI agents that execute multi-step workflows automatically. Chain language models to research, generate, and process data at scale.
          </p>
          
          <Link to="/builder">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center space-x-3 w-full sm:w-auto mx-auto rounded-2xl bg-primary-600 px-8 py-4 text-lg font-black text-white hover:bg-primary-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            >
              <span>Create Your First Agent</span>
              <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Architecture Flow Visual */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white">How It Works</h2>
        </div>
        
        <div className="glass-card rounded-3xl p-8 overflow-x-auto hide-scrollbar">
          <div className="min-w-[800px] flex items-center justify-between relative py-4">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 z-0" />
            
            {[
              { icon: PenTool, label: "User Prompt" },
              { icon: Bot, label: "Agent" },
              { icon: GitMerge, label: "Workflow Steps" },
              { icon: Sparkles, label: "AI Processing" },
              { icon: FileText, label: "Final Output" },
            ].map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-[#0B1120] border border-white/10 flex items-center justify-center shadow-xl shadow-black/50 mb-4 group hover:border-primary-500/50 transition-colors">
                  <node.icon size={24} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
                </div>
                <span className="text-sm font-bold text-slate-300">{node.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Explanation Steps */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="rounded-2xl bg-white/5 w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-primary-500/10 transition-colors">
              <step.icon size={24} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-black text-white mb-3">{step.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{step.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Use Cases */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white">Popular Use Cases</h2>
          <Link to="/templates" className="group flex items-center space-x-2 text-sm font-bold text-primary-400 hover:text-primary-300">
            <span>View Templates</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {useCases.map((useCase, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-8 rounded-3xl flex items-start space-x-6 group cursor-pointer"
            >
              <div className={`shrink-0 rounded-2xl ${useCase.bg} w-16 h-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <useCase.icon size={28} className={useCase.color} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary-400 transition-colors">{useCase.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{useCase.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
