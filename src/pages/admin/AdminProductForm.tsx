import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { X, UploadCloud } from 'lucide-react';
import type { ProductImage } from '@/types';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  discount_price: z.coerce.number().min(0).optional().or(z.literal(NaN)),
  stock_quantity: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminProductForm() {
  const { productId } = useParams();
  const isEdit = Boolean(productId);
  const navigate = useNavigate();
  const { categories } = useCategories();

  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('id', productId)
        .maybeSingle();
      if (error || !data) {
        toast.error('Product not found');
        navigate('/admin/products');
        return;
      }
      reset({
        title: data.title,
        description: data.description ?? '',
        price: data.price,
        discount_price: data.discount_price ?? undefined,
        stock_quantity: data.stock_quantity,
        sku: data.sku ?? '',
        category_id: data.category_id ?? '',
        is_featured: data.is_featured,
        is_active: data.is_active,
      });
      setExistingImages(data.product_images ?? []);
      setLoading(false);
    })();
  }, [isEdit, productId, navigate, reset]);

  const removeExistingImage = async (img: ProductImage) => {
    if (!confirm('Remove this image?')) return;
    await supabase.storage.from('product-images').remove([img.storage_path]);
    await supabase.from('product_images').delete().eq('id', img.id);
    setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const slug = slugify(data.title);
      const payload = {
        title: data.title,
        slug,
        description: data.description || null,
        price: data.price,
        discount_price: Number.isNaN(data.discount_price) ? null : data.discount_price || null,
        stock_quantity: data.stock_quantity,
        sku: data.sku || null,
        category_id: data.category_id || null,
        is_featured: !!data.is_featured,
        is_active: data.is_active ?? true,
      };

      let savedProductId = productId;

      if (isEdit) {
        const { error } = await supabase.from('products').update(payload).eq('id', productId);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        savedProductId = inserted.id;
      }

      // Upload any newly selected images
      if (newFiles.length && savedProductId) {
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const path = `${savedProductId}/${Date.now()}-${i}-${file.name.replace(/\s+/g, '-')}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
          if (uploadError) throw uploadError;
          const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
          await supabase.from('product_images').insert({
            product_id: savedProductId,
            image_url: pub.publicUrl,
            storage_path: path,
            sort_order: existingImages.length + i,
            is_primary: existingImages.length === 0 && i === 0,
          });
        }
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-white/40">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl mb-8">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 glass rounded-2xl p-8">
        <div>
          <label className="block text-sm text-white/60 mb-1">Title</label>
          <input {...register('title')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
          {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1">Description</label>
          <textarea {...register('description')} rows={4} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Price</label>
            <input type="number" step="0.01" {...register('price')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
            {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Discount Price</label>
            <input type="number" step="0.01" {...register('discount_price')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Stock Quantity</label>
            <input type="number" {...register('stock_quantity')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">SKU</label>
            <input {...register('sku')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Category</label>
            <select {...register('category_id')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold">
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_featured')} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('is_active')} defaultChecked /> Active
          </label>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">Images</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                <img src={img.image_url} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(img)} className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-sadeem-gold/50">
                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/70 rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 w-fit cursor-pointer border border-white/15 rounded-lg px-4 py-3 text-sm text-white/60 hover:border-sadeem-gold">
            <UploadCloud className="w-4 h-4" /> Upload Images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setNewFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-sadeem-gold text-black py-3 rounded-full font-medium hover:bg-sadeem-goldlight transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
