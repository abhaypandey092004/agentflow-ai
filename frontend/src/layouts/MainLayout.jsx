import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bot, 
  GitMerge, 
  History, 
  FileText, 
  UploadCloud, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const MainLayout = () => {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Agents', path: '/agents', icon: Bot },
    { name: 'Workflows', path: '/workflows', icon: GitMerge },
    { name: 'Execution History', path: '/history', icon: History },
    { name: 'Templates', path: '/templates', icon: FileText },
    { name: 'Documents', path: '/documents', icon: UploadCloud },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-transparent font-sans">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform glass transition-all duration-500 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-8">
          <h1 className="text-2xl font-black text-gradient tracking-tighter">
            AgentFlow AI
          </h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-8">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary-500/10 text-primary-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div 
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-xl border border-primary-500/20 bg-primary-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                        />
                      )}
                      <item.icon size={20} className={`relative z-10 ${isActive ? 'glow-primary' : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="relative z-10">{item.name}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/5 p-6 bg-white/2">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-100">{profile?.name || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{profile?.email}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex w-full items-center justify-center space-x-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        <header className="flex h-20 items-center justify-between px-8 bg-transparent lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl glass text-slate-300 lg:hidden hover:text-white"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Header badges or status could go here */}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-12 pt-4 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
