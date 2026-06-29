import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

interface Options {
  categorySlug?: string;
  featuredOnly?: boolean;
  limit?: number;
  includeInactive?: boolean;
}

export function useProducts(options: Options = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let query = supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .order('created_at', { ascending: false });
    if (!options.includeInactive) query = query.eq('is_active', true);

    if (options.featuredOnly) query = query.eq('is_featured', true);
    if (options.limit) query = query.limit(options.limit);

    const { data, error: err } = await query;
    if (err) {
      setError(err.message);
      setProducts([]);
    } else {
      let result = (data as Product[]) ?? [];
      if (options.categorySlug) {
        result = result.filter((p) => p.category?.slug === options.categorySlug);
      }
      setProducts(result);
    }
    setIsLoading(false);
  }, [options.categorySlug, options.featuredOnly, options.limit, options.includeInactive]);

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_images' }, fetchProducts)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(slugOrId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slugOrId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    let active = true;
    (async () => {
      setIsLoading(true);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), product_images(*)')
        .eq(isUuid ? 'id' : 'slug', slugOrId)
        .eq('is_active', true)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        setNotFound(true);
        setProduct(null);
      } else {
        setProduct(data as Product);
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slugOrId]);

  return { product, isLoading, notFound };
}
