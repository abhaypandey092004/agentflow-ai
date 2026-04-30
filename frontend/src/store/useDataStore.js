import { create } from 'zustand';
import api from '../lib/api';
import { supabase } from '../lib/supabase';

export const useDataStore = create((set, get) => ({
  agents: [],
  workflows: [],
  executions: [],
  documents: [],
  templates: [],
  stats: { agents: 0, workflows: 0, executions: 0 },
  loading: {
    agents: false,
    workflows: false,
    executions: false,
    dashboard: false,
    documents: false,
    templates: false
  },
  lastFetched: {
    agents: 0,
    workflows: 0,
    executions: 0,
    dashboard: 0,
    documents: 0,
    templates: 0
  },
  isFetching: {
    agents: false,
    workflows: false,
    executions: false,
    dashboard: false,
    documents: false,
    templates: false
  },

  // Cache duration in milliseconds (30 seconds)
  CACHE_DURATION: 30000,

  fetchAgents: async (force = false) => {
    const { agents, lastFetched, CACHE_DURATION, isFetching } = get();
    if (isFetching.agents) return;
    const now = Date.now();
    
    if (!force && agents.length > 0 && (now - lastFetched.agents < CACHE_DURATION)) {
      return;
    }

    set((state) => ({ 
      isFetching: { ...state.isFetching, agents: true },
      loading: { ...state.loading, agents: true } 
    }));
    try {
      const { data } = await api.get('/agents');
      set((state) => ({ 
        agents: data, 
        lastFetched: { ...state.lastFetched, agents: now },
        loading: { ...state.loading, agents: false },
        isFetching: { ...state.isFetching, agents: false }
      }));
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      set((state) => ({ 
        loading: { ...state.loading, agents: false },
        isFetching: { ...state.isFetching, agents: false }
      }));
    }
  },

  fetchWorkflows: async (force = false) => {
    const { workflows, lastFetched, CACHE_DURATION } = get();
    const now = Date.now();
    
    if (!force && workflows.length > 0 && (now - lastFetched.workflows < CACHE_DURATION)) {
      return;
    }

    set((state) => ({ loading: { ...state.loading, workflows: true } }));
    try {
      const { data } = await api.get('/workflows');
      set((state) => ({ 
        workflows: data, 
        lastFetched: { ...state.lastFetched, workflows: now },
        loading: { ...state.loading, workflows: false }
      }));
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      set((state) => ({ loading: { ...state.loading, workflows: false } }));
    }
  },

  fetchExecutions: async (force = false) => {
    const { executions, lastFetched, CACHE_DURATION } = get();
    const now = Date.now();
    
    if (!force && executions.length > 0 && (now - lastFetched.executions < CACHE_DURATION)) {
      return;
    }

    set((state) => ({ loading: { ...state.loading, executions: true } }));
    try {
      const { data } = await api.get('/executions');
      set((state) => ({ 
        executions: data, 
        lastFetched: { ...state.lastFetched, executions: now },
        loading: { ...state.loading, executions: false }
      }));
    } catch (err) {
      console.error('Failed to fetch executions:', err);
      set((state) => ({ loading: { ...state.loading, executions: false } }));
    }
  },

  fetchDashboardData: async (force = false) => {
    const { lastFetched, CACHE_DURATION, isFetching } = get();
    if (isFetching.dashboard) return;
    const now = Date.now();
    
    if (!force && (now - lastFetched.dashboard < CACHE_DURATION)) {
      return;
    }

    set((state) => ({ 
      isFetching: { ...state.isFetching, dashboard: true },
      loading: { ...state.loading, dashboard: true } 
    }));
    try {
      const [agentsRes, workflowsRes, executionsRes] = await Promise.all([
        api.get('/agents'),
        api.get('/workflows'),
        api.get('/executions')
      ]);

      set((state) => ({ 
        stats: {
          agents: agentsRes.data.length,
          workflows: workflowsRes.data.length,
          executions: executionsRes.data.length
        },
        executions: executionsRes.data,
        lastFetched: { ...state.lastFetched, dashboard: now },
        loading: { ...state.loading, dashboard: false },
        isFetching: { ...state.isFetching, dashboard: false }
      }));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      set((state) => ({ 
        loading: { ...state.loading, dashboard: false },
        isFetching: { ...state.isFetching, dashboard: false }
      }));
    }
  },

  fetchDocuments: async (force = false) => {
    const { documents, lastFetched, CACHE_DURATION } = get();
    const now = Date.now();
    
    if (!force && documents.length > 0 && (now - lastFetched.documents < CACHE_DURATION)) {
      return;
    }

    set((state) => ({ loading: { ...state.loading, documents: true } }));
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set((state) => ({ 
        documents: data || [], 
        lastFetched: { ...state.lastFetched, documents: now },
        loading: { ...state.loading, documents: false }
      }));
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      set((state) => ({ loading: { ...state.loading, documents: false } }));
    }
  },

  fetchTemplates: async (force = false) => {
    const { templates, lastFetched, CACHE_DURATION } = get();
    const now = Date.now();
    
    if (!force && templates.length > 0 && (now - lastFetched.templates < CACHE_DURATION)) {
      return;
    }

    set((state) => ({ loading: { ...state.loading, templates: true } }));
    try {
      const { data } = await api.get('/templates');
      set((state) => ({ 
        templates: data || [], 
        lastFetched: { ...state.lastFetched, templates: now },
        loading: { ...state.loading, templates: false }
      }));
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      set((state) => ({ loading: { ...state.loading, templates: false } }));
    }
  },

  // Mutators to update cache locally
  addAgent: (agent) => set((state) => ({ agents: [agent, ...state.agents] })),
  updateAgent: (agent) => set((state) => ({ 
    agents: state.agents.map(a => a.id === agent.id ? agent : a) 
  })),
  removeAgent: (id) => set((state) => ({ 
    agents: state.agents.filter(a => a.id !== id) 
  })),

  addWorkflow: (workflow) => set((state) => ({ workflows: [workflow, ...state.workflows] })),
  updateWorkflow: (workflow) => set((state) => ({ 
    workflows: state.workflows.map(w => w.id === workflow.id ? workflow : w) 
  })),
  removeWorkflow: (id) => set((state) => ({ 
    workflows: state.workflows.filter(w => w.id !== id) 
  })),

  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  removeDocument: (id) => set((state) => ({ 
    documents: state.documents.filter(d => d.id !== id) 
  }))
}));
