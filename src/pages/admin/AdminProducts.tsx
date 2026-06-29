import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { products, isLoading, refetch } = useProducts({ includeInactive: true });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently? This will also remove its images.')) return;
    setDeletingId(id);
    try {
      // Fetch image storage paths to clean up storage objects
      const { data: images } = await supabase.from('product_images').select('storage_path').eq('product_id', id);
      if (images?.length) {
        await supabase.storage.from('product-images').remove(images.map((i) => i.storage_path));
      }
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted');
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl">Products</h1>
        <Link to="/admin/products/new" className="flex items-center gap-2 bg-sadeem-gold text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-sadeem-goldlight">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td className="p-4 text-white/40" colSpan={5}>Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td className="p-4 text-white/40" colSpan={5}>No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="p-4 flex items-center gap-3">
                    <img src={p.product_images?.[0]?.image_url || '/placeholder.jpg'} className="w-10 h-10 rounded object-cover" />
                    {p.title}
                  </td>
                  <td className="p-4">{p.discount_price ?? p.price} SAR</td>
                  <td className="p-4">{p.stock_quantity}</td>
                  <td className="p-4">
                    <span className={p.is_active ? 'text-green-400' : 'text-white/40'}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link to={`/admin/products/${p.id}/edit`} className="text-sadeem-gold inline-flex"><Pencil className="w-4 h-4" /></Link>
                    <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="text-red-400 inline-flex">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
