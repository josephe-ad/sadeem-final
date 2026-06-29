import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { AdminUser } from '@/types';

interface AuthState {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  adminUser: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    set({ isLoading: true });
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (userId) {
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .maybeSingle();
      set({ adminUser: adminRow ?? null, isAuthenticated: !!adminRow, isLoading: false });
    } else {
      set({ adminUser: null, isAuthenticated: false, isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: adminRow } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();
        set({ adminUser: adminRow ?? null, isAuthenticated: !!adminRow });
      } else {
        set({ adminUser: null, isAuthenticated: false });
      }
    });
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const userId = data.user?.id;
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .eq('is_active', true)
      .maybeSingle();
    if (!adminRow) {
      await supabase.auth.signOut();
      return { error: 'This account does not have admin access.' };
    }
    set({ adminUser: adminRow, isAuthenticated: true });
    return { error: null };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ adminUser: null, isAuthenticated: false });
  },
}));
