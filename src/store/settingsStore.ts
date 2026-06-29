import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';

interface SettingsState {
  settings: SiteSettings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  subscribeToSettings: () => () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: true,

  fetchSettings: async () => {
    set({ isLoading: true });
    const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    set({ settings: data ?? null, isLoading: false });
  },

  subscribeToSettings: () => {
    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        set({ settings: payload.new as SiteSettings });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
