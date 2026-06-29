import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Package, Tag, ShoppingCart, Settings, Users, LogOut } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/users', label: 'Admin Users', icon: Users },
];

export default function AdminLayout() {
  const { adminUser, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-sadeem-black text-sadeem-white">
      <aside className="w-64 glass flex flex-col p-6">
        <h1 className="font-display text-xl gold-text mb-10">SADEEM Admin</h1>
        <nav className="flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors',
                  isActive ? 'bg-sadeem-gold text-black' : 'text-white/60 hover:bg-white/5'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">{adminUser?.email} · {adminUser?.role}</p>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-white/60 hover:text-red-400">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
