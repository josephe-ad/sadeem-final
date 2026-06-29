import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '@/types';

export default function ProductCard({ product }: { product: Product }) {
  const img =
    product.product_images?.find((i) => i.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    '/placeholder.jpg';
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.slug || product.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl glass">
          <img
            src={img}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-sadeem-gold text-black text-xs px-2 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-lg">{product.title}</h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sadeem-gold font-medium">{product.discount_price} SAR</span>
                <span className="text-white/40 line-through text-sm">{product.price} SAR</span>
              </>
            ) : (
              <span className="text-sadeem-gold font-medium">{product.price} SAR</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
