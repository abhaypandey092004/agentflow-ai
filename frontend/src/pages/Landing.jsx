import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Zap, Shield, FileText, ArrowRight, BrainCircuit, Activity, TreePine, Globe, Briefcase, GraduationCap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 rounded-2xl flex flex-col items-start text-left"
  >
    <div className="rounded-xl bg-blue-500/10 p-3 mb-4">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

const UseCaseCard = ({ icon: Icon, title, description }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors"
  >
    <div className="flex items-center space-x-4 mb-3">
      <Icon className="w-8 h-8 text-primary-400" />
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <p className="text-sm text-slate-400">{description}</p>
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-black text-white tracking-tight">AgentFlow AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Production Ready Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 tracking-tighter">
            Automate complexity with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Autonomous AI Agents
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Create intelligent agents that research, process, and generate results. Turn simple prompts into powerful multi-step workflows instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 text-base font-black text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2"
            >
              <span>Build Your First Agent</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              See How It Works
            </button>
          </div>
        </motion.div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white mb-4">Enterprise-Grade Intelligence</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Built for scale, security, and simplicity. Zero technical complexity exposed to the user.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard 
            icon={Zap}
            title="Auto-Workflow Generation"
            description="Just provide a goal. The system automatically structures the optimal research, processing, and output steps."
          />
          <FeatureCard 
            icon={Shield}
            title="Secure & Reliable"
            description="Strict CSP, rate limiting, magic-byte file validation, and robust prompt injection protection."
          />
          <FeatureCard 
            icon={FileText}
            title="Structured PDF Exports"
            description="Generate beautifully formatted PDF reports from AI outputs instantly, ready for professional use."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-4">Three Steps to Automation</h2>
            <p className="text-slate-400">From idea to execution in seconds.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 flex-1">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4 border border-blue-500/20">1</div>
              <h3 className="text-xl font-bold text-white mb-2">Create Agent</h3>
              <p className="text-sm text-slate-400">Define a name and provide a simple prompt describing what you want to achieve.</p>
            </div>
            <ArrowRight className="hidden md:block w-8 h-8 text-slate-600" />
            <div className="text-center p-6 flex-1">
              <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4 border border-purple-500/20">2</div>
              <h3 className="text-xl font-bold text-white mb-2">System Thinks</h3>
              <p className="text-sm text-slate-400">AgentFlow auto-generates a multi-step pipeline mapping the optimal reasoning path.</p>
            </div>
            <ArrowRight className="hidden md:block w-8 h-8 text-slate-600" />
            <div className="text-center p-6 flex-1">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-4 border border-emerald-500/20">3</div>
              <h3 className="text-xl font-bold text-white mb-2">Real AI Output</h3>
              <p className="text-sm text-slate-400">Watch the execution live and download the final comprehensive results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white mb-4">Endless Possibilities</h2>
          <p className="text-slate-400">AgentFlow adapts to your specific industry needs.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <UseCaseCard 
            icon={GraduationCap}
            title="Education"
            description="AI tutor that adapts explanations based on student mistakes."
          />
          <UseCaseCard 
            icon={Activity}
            title="Healthcare"
            description="NLP symptom checker analyzing patient history contextually."
          />
          <UseCaseCard 
            icon={TreePine}
            title="Agriculture"
            description="Smart crop advisory combining weather patterns with soil data."
          />
          <UseCaseCard 
            icon={Globe}
            title="Environment"
            description="Automated carbon footprint tracking and optimization analysis."
          />
          <UseCaseCard 
            icon={BrainCircuit}
            title="AI/ML"
            description="AutoML system orchestration and hyperparameter tuning."
          />
          <UseCaseCard 
            icon={Briefcase}
            title="Career"
            description="Intelligent resume analyzer mapping skills to job market gaps."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#020617] pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-black text-white tracking-tight">AgentFlow AI</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} AgentFlow AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
