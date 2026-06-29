import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const { categories, refetch } = useCategories();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const slugify = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

  const addCategory = async () => {
    if (!name.trim()) return;
    setAdding(true);
    const { error } = await supabase.from('categories').insert({ name, slug: slugify(name) });
    setAdding(false);
    if (error) { toast.error(error.message); return; }
    setName('');
    toast.success('Category added');
    refetch();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Products in it will become uncategorized.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Category deleted');
    refetch();
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Categories</h1>
      <div className="flex gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold"
        />
        <button onClick={addCategory} disabled={adding} className="flex items-center gap-2 bg-sadeem-gold text-black px-5 rounded-lg font-medium">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <div className="glass rounded-xl divide-y divide-white/5">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4">
            <div>
              <p>{c.name}</p>
              <p className="text-xs text-white/40">/{c.slug}</p>
            </div>
            <button onClick={() => deleteCategory(c.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
