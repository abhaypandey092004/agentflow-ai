
import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Zap,
  MessageSquareText,
  Workflow,
  Wand2,
  CopyCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Dashboard = () => {
  const profile = useAuthStore((state) => state.profile);

  const steps = [
    {
      icon: Bot,
      title: 'Create Agent',
      desc: 'Give your assistant a role and purpose.',
      accent: 'from-blue-500/25 to-cyan-500/10 text-cyan-300',
    },
    {
      icon: MessageSquareText,
      title: 'Ask Anything',
      desc: 'Write your task in simple language.',
      accent: 'from-purple-500/25 to-pink-500/10 text-purple-300',
    },
    {
      icon: Wand2,
      title: 'Generate',
      desc: 'Get polished AI output instantly.',
      accent: 'from-amber-500/25 to-orange-500/10 text-amber-300',
    },
    {
      icon: CopyCheck,
      title: 'Use Result',
      desc: 'Copy, improve, or build workflows.',
      accent: 'from-emerald-500/25 to-teal-500/10 text-emerald-300',
    },
  ];

  return (
    <div className="space-y-10 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 px-8 py-14 sm:px-14 sm:py-20 shadow-2xl">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-blue-600/25 blur-[90px]" />
        <div className="absolute -bottom-28 right-12 h-80 w-80 rounded-full bg-purple-600/25 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 mx-auto max-w-4xl text-center"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />
            Welcome, {profile?.name?.split(' ')[0] || 'Creator'}
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-7xl">
            Build AI agents
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              without complex setup
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Create an agent, ask your question, and get output instantly. Use the
            advanced workflow builder only when you need multi-step automation.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/agent-runner" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-black text-white shadow-[0_0_45px_rgba(99,102,241,0.45)] transition-all hover:from-blue-500 hover:to-purple-500"
              >
                <Zap size={21} />
                Create Your First Agent
                <ArrowRight size={20} />
              </motion.button>
            </Link>

            <Link to="/workflows/builder" className="w-full sm:w-auto">
              <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-slate-200 transition-all hover:bg-white/10">
                <Workflow size={20} />
                Advanced Builder
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            className="group rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-slate-900/70"
          >
            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent}`}>
              <step.icon size={25} />
            </div>
            <h3 className="mb-2 text-lg font-black text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
};

export default Dashboard;