import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { disconnectSocket } from '../lib/socket';

let authSubscription = null;

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  profileLoadedFor: null,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null, profileLoadedFor: null });
      }

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          const currentUserId = get().user?.id;
          const newUserId = session?.user?.id;

          if (currentUserId === newUserId && get().profileLoadedFor === newUserId) {
            return;
          }

          set({ user: session?.user || null });

          if (session?.user) {
            await get().fetchProfile(session.user.id);
          } else {
            set({ profile: null, profileLoadedFor: null });
            disconnectSocket();
          }
        });

        authSubscription = data.subscription;
      }
    } catch (error) {
      console.error('Auth initialize error:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (userId) => {
    if (!userId) return;

    if (get().profileLoadedFor === userId && get().profile) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return;
    }

    set({
      profile: data,
      profileLoadedFor: userId,
    });
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
        data: { name },
      },
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    set({
      user: null,
      profile: null,
      profileLoadedFor: null,
    });

    disconnectSocket();
  },
}));