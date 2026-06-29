import { useParams, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { productId } = useParams();
  const { product, isLoading, notFound } = useProduct(productId);
  const addItem = useCartStore((s) => s.addItem);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  // Guard against malformed/empty param — never throw, always redirect safely
  if (!productId || productId.trim() === '') {
    return <Navigate to="/shop" replace />;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return <Navigate to="/404" replace />;
  }

  const images = product.product_images?.length
    ? product.product_images
    : [{ id: 'placeholder', image_url: '/placeholder.jpg' } as any];
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const inStock = product.stock_quantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <div className="aspect-[3/4] rounded-2xl overflow-hidden glass mb-4">
          <img src={images[activeImage]?.image_url} alt={product.title} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border ${i === activeImage ? 'border-sadeem-gold' : 'border-white/10'}`}
              >
                <img src={img.image_url} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.category && (
          <p className="text-sadeem-gold text-sm uppercase tracking-wide mb-2">{product.category.name}</p>
        )}
        <h1 className="font-display text-3xl mb-4">{product.title}</h1>
        <div className="flex items-center gap-3 mb-6">
          {hasDiscount ? (
            <>
              <span className="text-2xl text-sadeem-gold">{product.discount_price} SAR</span>
              <span className="text-white/40 line-through">{product.price} SAR</span>
            </>
          ) : (
            <span className="text-2xl text-sadeem-gold">{product.price} SAR</span>
          )}
        </div>
        <p className="text-white/60 leading-relaxed mb-8 whitespace-pre-line">{product.description}</p>

        {inStock ? (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-white/15 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10">−</button>
              <span className="w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))} className="w-10 h-10">+</button>
            </div>
            <button
              onClick={() => {
                addItem(product, qty);
                toast.success('Added to cart');
              }}
              className="flex-1 bg-sadeem-gold text-black py-3 rounded-full font-medium hover:bg-sadeem-goldlight transition-colors"
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <p className="text-red-400 mb-6">Out of stock</p>
        )}
        {product.sku && <p className="text-xs text-white/30">SKU: {product.sku}</p>}
      </div>
    </div>
  );
}
