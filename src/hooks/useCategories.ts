import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    setCategories((data as Category[]) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
    const channel = supabase
      .channel('categories_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCategories]);

  return { categories, isLoading, refetch: fetchCategories };
}
