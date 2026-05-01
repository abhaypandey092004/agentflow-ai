import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { initSocket, disconnectSocket } from '../lib/socket';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      set({ user: session.user });
      await useAuthStore.getState().fetchProfile(session.user.id);
    }
    
    set({ loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user || null });
      if (session?.user) {
        await useAuthStore.getState().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
        disconnectSocket();
      }
    });
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!error && data) {
      set({ profile: data });
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
    disconnectSocket();
  }
}));
