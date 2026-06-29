import { useParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductCard from '@/components/shop/ProductCard';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function Shop() {
  const { categorySlug } = useParams();
  const { products, isLoading } = useProducts({ categorySlug });
  const { categories } = useCategories();

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl mb-2">{activeCategory?.name || 'All Collections'}</h1>
      <p className="text-white/50 mb-10">{activeCategory?.description}</p>

      <div className="flex gap-3 mb-10 flex-wrap">
        <Link
          to="/shop"
          className={clsx(
            'px-4 py-2 rounded-full text-sm border transition-colors',
            !categorySlug ? 'border-sadeem-gold text-sadeem-gold' : 'border-white/15 text-white/60 hover:border-white/40'
          )}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/shop/${c.slug}`}
            className={clsx(
              'px-4 py-2 rounded-full text-sm border transition-colors',
              categorySlug === c.slug ? 'border-sadeem-gold text-sadeem-gold' : 'border-white/15 text-white/60 hover:border-white/40'
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-white/40 text-center py-20">No products found in this collection yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
