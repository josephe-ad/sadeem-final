import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/types';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data } = await query;
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Order status updated');
    fetchOrders();
  };

  const filtered = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone_number.includes(search)
  );

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Orders</h1>
      <div className="flex gap-4 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, order #"
          className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/15 rounded-lg px-4 py-3">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => window.print()} className="border border-white/15 px-4 rounded-lg text-sm">Print</button>
      </div>

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="glass rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium">#{order.order_number} — {order.customer_name}</p>
                  <p className="text-sm text-white/50">{order.phone_number} · {order.city}, {order.address}</p>
                  {order.notes && <p className="text-sm text-white/40 mt-1">Note: {order.notes}</p>}
                </div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="text-sm text-white/60 space-y-1">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product_title} × {item.quantity}</span>
                    <span>{item.line_total} {order.currency}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 mt-3 pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-sadeem-gold">{order.total} {order.currency}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-white/40">No orders found.</p>}
        </div>
      )}
    </div>
  );
}
