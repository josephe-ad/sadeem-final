import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from '@/components/shop/ProductCard';

export default function Home() {
  const settings = useSettingsStore((s) => s.settings);
  const { products, isLoading } = useProducts({ featuredOnly: true, limit: 8 });
  const { categories } = useCategories();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.1), transparent 40%)'
        }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative z-10 text-center px-6"
        >
          <h1 className="font-display text-5xl md:text-7xl gold-text mb-6">
            {settings?.hero_title || 'SADEEM'}
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
            {settings?.hero_subtitle || 'Born from the stars. Crafted for elegance.'}
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-3 border border-sadeem-gold text-sadeem-gold rounded-full hover:bg-sadeem-gold hover:text-black transition-all duration-300"
          >
            Explore Collections
          </Link>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-12">Collections</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/shop/${c.slug}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden glass"
            >
              <img
                src={c.image_url || '/placeholder-category.jpg'}
                alt={c.name}
                loading="lazy"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="font-display text-2xl">{c.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-12">Featured Pieces</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-white/40">No featured products yet. Add some from the admin dashboard.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
