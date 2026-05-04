// // // import React from 'react';
// // // import { motion } from 'framer-motion';
// // // import { 
// // //   Bot, 
// // //   GitMerge, 
// // //   PlayCircle, 
// // //   Download, 
// // //   ArrowRight,
// // //   PenTool,
// // //   Search,
// // //   FileText,
// // //   Sparkles,
// // //   ArrowUpRight
// // // } from 'lucide-react';
// // // import { Link } from 'react-router-dom';
// // // import { useAuthStore } from '../store/useAuthStore';

// // // const Dashboard = () => {
// // //   const profile = useAuthStore(state => state.profile);

// // //   const steps = [
// // //     { icon: Bot, title: "1. Create Agent", desc: "Define your custom AI agent with specific instructions and models." },
// // //     { icon: GitMerge, title: "2. Build Workflow", desc: "Chain together multiple steps like research, summarize, and generate." },
// // //     { icon: PlayCircle, title: "3. Run Automation", desc: "Execute the workflow and watch the AI process each step sequentially." },
// // //     { icon: Download, title: "4. Export Output", desc: "Download the final generated content in PDF or DOCX formats." },
// // //   ];

// // //   const useCases = [
// // //     { icon: PenTool, title: "Blog Writing", desc: "Research a topic, outline structure, and generate full SEO-optimized articles.", color: "text-blue-400", bg: "bg-blue-500/10" },
// // //     { icon: Search, title: "Research Assistant", desc: "Gather data, analyze sources, and summarize key findings automatically.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
// // //     { icon: FileText, title: "Document Summarizer", desc: "Extract key points, entities, and action items from long documents.", color: "text-purple-400", bg: "bg-purple-500/10" },
// // //     { icon: Sparkles, title: "Content Generator", desc: "Create social media posts, ad copy, and email sequences in seconds.", color: "text-amber-400", bg: "bg-amber-500/10" },
// // //   ];

// // //   return (
// // //     <div className="space-y-16 pb-10">
// // //       {/* Hero Section */}
// // //       <section className="relative overflow-hidden rounded-3xl glass-card border border-white/10 p-8 sm:p-16 flex flex-col items-center text-center">
// // //         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />
        
// // //         <motion.div
// // //           initial={{ opacity: 0, y: 20 }}
// // //           animate={{ opacity: 1, y: 0 }}
// // //           className="relative z-10 max-w-3xl"
// // //         >
// // //           <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 mb-8">
// // //             <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
// // //             <span>Welcome, {profile?.name?.split(' ')[0] || 'Creator'}</span>
// // //           </div>
          
// // //           <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
// // //             AgentFlow <span className="text-gradient">AI</span>
// // //           </h1>
          
// // //           <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
// // //             Build custom AI agents that execute multi-step workflows automatically. Chain language models to research, generate, and process data at scale.
// // //           </p>
          
// // //           <Link to="/workflows/builder">
// // //             <motion.button
// // //               whileHover={{ scale: 1.05 }}
// // //               whileTap={{ scale: 0.95 }}
// // //               className="flex items-center justify-center space-x-3 w-full sm:w-auto mx-auto rounded-2xl bg-primary-600 px-8 py-4 text-lg font-black text-white hover:bg-primary-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)]"
// // //             >
// // //               <span>Create Your First Agent</span>
// // //               <ArrowRight size={20} />
// // //             </motion.button>
// // //           </Link>
// // //         </motion.div>
// // //       </section>

// // //       {/* Architecture Flow Visual */}
// // //       <section>
// // //         <div className="flex items-center justify-between mb-8">
// // //           <h2 className="text-2xl font-black text-white">How It Works</h2>
// // //         </div>
        
// // //         <div className="glass-card rounded-3xl p-8 overflow-x-auto hide-scrollbar">
// // //           <div className="min-w-[800px] flex items-center justify-between relative py-4">
// // //             <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 z-0" />
            
// // //             {[
// // //               { icon: PenTool, label: "User Prompt" },
// // //               { icon: Bot, label: "Agent" },
// // //               { icon: GitMerge, label: "Workflow Steps" },
// // //               { icon: Sparkles, label: "AI Processing" },
// // //               { icon: FileText, label: "Final Output" },
// // //             ].map((node, i) => (
// // //               <motion.div
// // //                 key={i}
// // //                 initial={{ opacity: 0, scale: 0.8 }}
// // //                 whileInView={{ opacity: 1, scale: 1 }}
// // //                 viewport={{ once: true }}
// // //                 transition={{ delay: i * 0.1 }}
// // //                 className="relative z-10 flex flex-col items-center"
// // //               >
// // //                 <div className="h-16 w-16 rounded-2xl bg-[#0B1120] border border-white/10 flex items-center justify-center shadow-xl shadow-black/50 mb-4 group hover:border-primary-500/50 transition-colors">
// // //                   <node.icon size={24} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
// // //                 </div>
// // //                 <span className="text-sm font-bold text-slate-300">{node.label}</span>
// // //               </motion.div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       </section>

// // //       {/* Project Explanation Steps */}
// // //       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// // //         {steps.map((step, i) => (
// // //           <motion.div
// // //             key={i}
// // //             initial={{ opacity: 0, y: 20 }}
// // //             whileInView={{ opacity: 1, y: 0 }}
// // //             viewport={{ once: true }}
// // //             transition={{ delay: i * 0.1 }}
// // //             className="glass-card p-8 rounded-3xl relative overflow-hidden group"
// // //           >
// // //             <div className="rounded-2xl bg-white/5 w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-primary-500/10 transition-colors">
// // //               <step.icon size={24} className="text-slate-400 group-hover:text-primary-400 transition-colors" />
// // //             </div>
// // //             <h3 className="text-lg font-black text-white mb-3">{step.title}</h3>
// // //             <p className="text-sm text-slate-400 leading-relaxed font-medium">{step.desc}</p>
// // //           </motion.div>
// // //         ))}
// // //       </section>

// // //       {/* Use Cases */}
// // //       <section>
// // //         <div className="flex items-center justify-between mb-8">
// // //           <h2 className="text-2xl font-black text-white">Popular Use Cases</h2>
// // //           <Link to="/templates" className="group flex items-center space-x-2 text-sm font-bold text-primary-400 hover:text-primary-300">
// // //             <span>View Templates</span>
// // //             <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
// // //           </Link>
// // //         </div>
        
// // //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
// // //           {useCases.map((useCase, i) => (
// // //             <motion.div
// // //               key={i}
// // //               initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
// // //               whileInView={{ opacity: 1, x: 0 }}
// // //               viewport={{ once: true }}
// // //               whileHover={{ scale: 1.02 }}
// // //               className="glass-card p-8 rounded-3xl flex items-start space-x-6 group cursor-pointer"
// // //             >
// // //               <div className={`shrink-0 rounded-2xl ${useCase.bg} w-16 h-16 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
// // //                 <useCase.icon size={28} className={useCase.color} />
// // //               </div>
// // //               <div>
// // //                 <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary-400 transition-colors">{useCase.title}</h3>
// // //                 <p className="text-slate-400 font-medium leading-relaxed">{useCase.desc}</p>
// // //               </div>
// // //             </motion.div>
// // //           ))}
// // //         </div>
// // //       </section>

// // //     </div>
// // //   );
// // // };

// // // export default Dashboard;
// // import React from 'react';
// // import { motion } from 'framer-motion';
// // import {
// //   Bot,
// //   GitMerge,
// //   PlayCircle,
// //   Download,
// //   ArrowRight,
// //   PenTool,
// //   Search,
// //   FileText,
// //   Sparkles,
// //   ArrowUpRight
// // } from 'lucide-react';
// // import { Link } from 'react-router-dom';
// // import { useAuthStore } from '../store/useAuthStore';

// // const Dashboard = () => {
// //   const profile = useAuthStore((state) => state.profile);

// //   const steps = [
// //     { icon: Bot, title: "1. Create Agent", desc: "Define your custom AI agent with specific instructions and models." },
// //     { icon: GitMerge, title: "2. Build Workflow", desc: "Chain together multiple steps like research, summarize, and generate." },
// //     { icon: PlayCircle, title: "3. Run Automation", desc: "Execute the workflow and watch the AI process each step sequentially." },
// //     { icon: Download, title: "4. Export Output", desc: "Download the final generated content in PDF or DOCX formats." },
// //   ];

// //   const useCases = [
// //     { icon: PenTool, title: "Blog Writing", desc: "Research a topic, outline structure, and generate full SEO-optimized articles.", color: "text-blue-400", bg: "bg-blue-500/10" },
// //     { icon: Search, title: "Research Assistant", desc: "Gather data, analyze sources, and summarize key findings automatically.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
// //     { icon: FileText, title: "Document Summarizer", desc: "Extract key points, entities, and action items from long documents.", color: "text-purple-400", bg: "bg-purple-500/10" },
// //     { icon: Sparkles, title: "Content Generator", desc: "Create social media posts, ad copy, and email sequences in seconds.", color: "text-amber-400", bg: "bg-amber-500/10" },
// //   ];

// //   return (
// //     <div className="space-y-16 pb-10">

// //       {/* Hero Section */}
// //       <section className="relative overflow-hidden rounded-3xl glass-card border border-white/10 p-8 sm:p-16 flex flex-col items-center text-center">
// //         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />

// //         <motion.div
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           className="relative z-10 max-w-3xl"
// //         >
// //           <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 mb-8">
// //             <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
// //             <span>Welcome, {profile?.name?.split(' ')[0] || 'Creator'}</span>
// //           </div>

// //           <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
// //             AgentFlow <span className="text-gradient">AI</span>
// //           </h1>

// //           <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
// //             Build custom AI agents that execute multi-step workflows automatically.
// //           </p>

// //           {/* ✅ UPDATED BUTTON */}
// //           <Link to="/workflows?createAgent=true">
// //             <motion.button
// //               whileHover={{ scale: 1.05 }}
// //               whileTap={{ scale: 0.95 }}
// //               className="flex items-center justify-center space-x-3 w-full sm:w-auto mx-auto rounded-2xl bg-primary-600 px-8 py-4 text-lg font-black text-white hover:bg-primary-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)]"
// //             >
// //               <span>Create Your First Agent</span>
// //               <ArrowRight size={20} />
// //             </motion.button>
// //           </Link>
// //         </motion.div>
// //       </section>

// //       {/* Steps */}
// //       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //         {steps.map((step, i) => (
// //           <motion.div
// //             key={i}
// //             initial={{ opacity: 0, y: 20 }}
// //             whileInView={{ opacity: 1, y: 0 }}
// //             viewport={{ once: true }}
// //             transition={{ delay: i * 0.1 }}
// //             className="glass-card p-8 rounded-3xl"
// //           >
// //             <step.icon className="text-primary-400 mb-4" size={24} />
// //             <h3 className="text-lg font-bold text-white">{step.title}</h3>
// //             <p className="text-sm text-slate-400">{step.desc}</p>
// //           </motion.div>
// //         ))}
// //       </section>

// //     </div>
// //   );
// // };

// // export default Dashboard;
// import React from 'react';
// import { motion } from 'framer-motion';
// import {
//   Bot,
//   PlayCircle,
//   Download,
//   ArrowRight,
//   Sparkles,
// } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import { useAuthStore } from '../store/useAuthStore';

// const Dashboard = () => {
//   const profile = useAuthStore((state) => state.profile);

//   const steps = [
//     {
//       icon: Bot,
//       title: '1. Create Agent',
//       desc: 'Give your agent a name and tell it what you want.',
//     },
//     {
//       icon: Sparkles,
//       title: '2. Ask Anything',
//       desc: 'Write your input or question in simple language.',
//     },
//     {
//       icon: PlayCircle,
//       title: '3. Generate Output',
//       desc: 'Run the agent and get instant AI output.',
//     },
//     {
//       icon: Download,
//       title: '4. Use Result',
//       desc: 'Copy, save, or improve the generated result.',
//     },
//   ];

//   return (
//     <div className="space-y-16 pb-10">
//       <section className="relative overflow-hidden rounded-3xl glass-card border border-white/10 p-8 sm:p-16 flex flex-col items-center text-center">
//         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />

//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.25 }}
//           className="relative z-10 max-w-3xl"
//         >
//           <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-bold text-slate-300 mb-8">
//             <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
//             <span>Welcome, {profile?.name?.split(' ')[0] || 'Creator'}</span>
//           </div>

//           <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-6 leading-tight">
//             AgentFlow <span className="text-gradient">AI</span>
//           </h1>

//           <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
//             Create an AI agent, ask your question, and get output instantly.
//             Use advanced workflows only when you need multi-step automation.
//           </p>

//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//             <Link to="/agent-runner" className="w-full sm:w-auto">
//               <motion.button
//                 whileHover={{ scale: 1.04 }}
//                 whileTap={{ scale: 0.96 }}
//                 className="flex items-center justify-center space-x-3 w-full rounded-2xl bg-primary-600 px-8 py-4 text-lg font-black text-white hover:bg-primary-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)]"
//               >
//                 <span>Create Your First Agent</span>
//                 <ArrowRight size={20} />
//               </motion.button>
//             </Link>

//             <Link to="/workflows/builder" className="w-full sm:w-auto">
//               <button className="w-full rounded-2xl border border-white/10 px-8 py-4 text-lg font-bold text-slate-300 hover:bg-white/5 transition-all">
//                 Advanced Builder
//               </button>
//             </Link>
//           </div>
//         </motion.div>
//       </section>

//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {steps.map((step, i) => (
//           <motion.div
//             key={step.title}
//             initial={{ opacity: 0, y: 16 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: i * 0.08 }}
//             className="glass-card p-8 rounded-3xl"
//           >
//             <step.icon className="text-primary-400 mb-4" size={24} />
//             <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
//             <p className="text-sm text-slate-400">{step.desc}</p>
//           </motion.div>
//         ))}
//       </section>
//     </div>
//   );
// };

// export default Dashboard;
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