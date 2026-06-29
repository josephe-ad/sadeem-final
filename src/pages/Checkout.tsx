import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const schema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  phone_number: z.string().min(8, 'Valid phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function generateOrderNumber() {
  return `SDM-${Date.now().toString().slice(-8)}`;
}

export default function Checkout() {
  const { items, subtotal, clear } = useCartStore();
  const settings = useSettingsStore((s) => s.settings);
  const shipping = settings?.shipping_price ?? 0;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (items.length === 0) {
    navigate('/shop');
    return null;
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const orderNumber = generateOrderNumber();
      const total = subtotal() + shipping;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: data.customer_name,
          phone_number: data.phone_number,
          address: data.address,
          city: data.city,
          notes: data.notes || null,
          subtotal: subtotal(),
          shipping_price: shipping,
          total,
          currency: settings?.currency ?? 'SAR',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_title: item.product.title,
        unit_price: item.product.discount_price ?? item.product.price,
        quantity: item.quantity,
        line_total: (item.product.discount_price ?? item.product.price) * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      await supabase.from('analytics_events').insert({
        event_type: 'order_placed',
        order_id: order.id,
        metadata: { total },
      });

      clear();
      navigate(`/order-success/${orderNumber}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 glass rounded-2xl p-8">
        <div>
          <label className="block text-sm text-white/60 mb-1">Full Name</label>
          <input {...register('customer_name')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
          {errors.customer_name && <p className="text-red-400 text-sm mt-1">{errors.customer_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Phone Number</label>
          <input {...register('phone_number')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
          {errors.phone_number && <p className="text-red-400 text-sm mt-1">{errors.phone_number.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">City</label>
            <input {...register('city')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
            {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Address</label>
            <input {...register('address')} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Notes (optional)</label>
          <textarea {...register('notes')} rows={3} className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold" />
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-between text-lg">
          <span>Total</span>
          <span className="text-sadeem-gold font-medium">{(subtotal() + shipping).toFixed(2)} SAR</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-sadeem-gold text-black py-3 rounded-full font-medium hover:bg-sadeem-goldlight transition-colors disabled:opacity-50"
        >
          {submitting ? 'Placing Order…' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
