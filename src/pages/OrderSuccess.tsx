import { useParams, Link, Navigate } from 'react-router-dom';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  if (!orderNumber) return <Navigate to="/" replace />;

  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-3xl gold-text mb-4">Order Confirmed</h1>
      <p className="text-white/60 mb-2">Thank you. Your order has been placed.</p>
      <p className="text-sadeem-gold mb-10">Order #{orderNumber}</p>
      <Link to="/shop" className="inline-block border border-sadeem-gold text-sadeem-gold px-6 py-3 rounded-full hover:bg-sadeem-gold hover:text-black transition-colors">
        Continue Shopping
      </Link>
    </div>
  );
}
