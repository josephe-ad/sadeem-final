import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingCart, DollarSign, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [{ count: productCount }, { count: orderCount }, { count: pendingCount }, { data: orders }] =
        await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('total'),
        ]);
      const revenue = (orders ?? []).reduce((sum, o: any) => sum + Number(o.total || 0), 0);
      setStats({
        products: productCount ?? 0,
        orders: orderCount ?? 0,
        pending: pendingCount ?? 0,
        revenue,
      });
    })();
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart },
    { label: 'Pending Orders', value: stats.pending, icon: Clock },
    { label: 'Revenue', value: `${stats.revenue.toFixed(2)} SAR`, icon: DollarSign },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-xl p-6">
            <Icon className="w-6 h-6 text-sadeem-gold mb-3" />
            <p className="text-2xl font-display">{value}</p>
            <p className="text-sm text-white/50">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
