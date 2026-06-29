import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const settings = useSettingsStore((s) => s.settings);
  const shipping = settings?.shipping_price ?? 0;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your bag is empty</h1>
        <Link to="/shop" className="text-sadeem-gold underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-10">Shopping Bag</h1>
      <div className="space-y-6">
        {items.map((item) => {
          const img = item.product.product_images?.[0]?.image_url || '/placeholder.jpg';
          const price = item.product.discount_price ?? item.product.price;
          return (
            <div key={item.product.id} className="flex gap-4 items-center glass rounded-xl p-4">
              <img src={img} className="w-20 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-display text-lg">{item.product.title}</h3>
                <p className="text-sadeem-gold">{price} SAR</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 border border-white/15 rounded-full">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 border border-white/15 rounded-full">+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.product.id)} className="text-white/40 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 space-y-2">
        <div className="flex justify-between text-white/60">
          <span>Subtotal</span>
          <span>{subtotal().toFixed(2)} SAR</span>
        </div>
        <div className="flex justify-between text-white/60">
          <span>Shipping</span>
          <span>{shipping.toFixed(2)} SAR</span>
        </div>
        <div className="flex justify-between text-xl font-medium mt-3">
          <span>Total</span>
          <span className="text-sadeem-gold">{(subtotal() + shipping).toFixed(2)} SAR</span>
        </div>
        <Link
          to="/checkout"
          className="block text-center mt-6 bg-sadeem-gold text-black py-3 rounded-full font-medium hover:bg-sadeem-goldlight transition-colors"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
