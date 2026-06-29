import { Link, NavLink, Outlet } from 'react-router-dom';
import { ShoppingBag, Instagram, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';

export default function StoreLayout() {
  const totalItems = useCartStore((s) => s.totalItems());
  const settings = useSettingsStore((s) => s.settings);

  return (
    <div className="min-h-screen flex flex-col bg-sadeem-black text-sadeem-white">
      <header className="sticky top-0 z-50 glass">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl tracking-widest gold-text">
            {settings?.hero_title || 'SADEEM'}
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
            <NavLink to="/shop/luxury-abayas" className="hover:text-sadeem-gold transition-colors">
              Abayas
            </NavLink>
            <NavLink to="/shop/premium-perfumes" className="hover:text-sadeem-gold transition-colors">
              Perfumes
            </NavLink>
            <NavLink to="/shop" className="hover:text-sadeem-gold transition-colors">
              All Collections
            </NavLink>
          </div>
          <Link to="/cart" className="relative">
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-sadeem-gold text-black text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h3 className="font-display text-xl gold-text mb-2">SADEEM</h3>
            <p className="text-sm text-white/50 max-w-xs">
              {settings?.seo_description || 'Luxury born from the stars.'}
            </p>
          </div>
          <div className="flex gap-4 items-start">
            {settings?.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noreferrer">
                <Instagram className="w-5 h-5 hover:text-sadeem-gold" />
              </a>
            )}
            {settings?.whatsapp_number && (
              <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer">
                <MessageCircle className="w-5 h-5 hover:text-sadeem-gold" />
              </a>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-white/30 pb-6">
          © {new Date().getFullYear()} SADEEM. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
