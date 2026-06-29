import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation() as any;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sadeem-black px-6">
      <form onSubmit={onSubmit} className="glass rounded-2xl p-10 w-full max-w-sm space-y-5">
        <h1 className="font-display text-2xl gold-text text-center mb-2">SADEEM Admin</h1>
        <div>
          <label className="block text-sm text-white/60 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 outline-none focus:border-sadeem-gold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sadeem-gold text-black py-3 rounded-full font-medium hover:bg-sadeem-goldlight transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
