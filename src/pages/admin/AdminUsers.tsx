import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { AdminUser, AdminRole } from '@/types';

export default function AdminUsers() {
  const { adminUser } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const isSuperAdmin = adminUser?.role === 'super_admin';

  const fetchUsers = async () => {
    const { data } = await supabase.from('admin_users').select('*').order('created_at');
    setUsers((data as AdminUser[]) ?? []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (id: string, role: AdminRole) => {
    const { error } = await supabase.from('admin_users').update({ role }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Role updated');
    fetchUsers();
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from('admin_users').update({ is_active: !is_active }).eq('id', id);
    if (error) { toast.error(error.message); return; }
    fetchUsers();
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Admin Users</h1>
      <p className="text-white/40 text-sm mb-8">
        New admin accounts are created via Supabase Auth, then linked here. {!isSuperAdmin && 'Only super admins can edit roles.'}
      </p>
      <div className="glass rounded-xl divide-y divide-white/5">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-4">
            <div>
              <p>{u.full_name || u.email}</p>
              <p className="text-xs text-white/40">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={u.role}
                disabled={!isSuperAdmin}
                onChange={(e) => updateRole(u.id, e.target.value as AdminRole)}
                className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
              >
                <option value="super_admin">super_admin</option>
                <option value="admin">admin</option>
                <option value="editor">editor</option>
              </select>
              <button
                disabled={!isSuperAdmin}
                onClick={() => toggleActive(u.id, u.is_active)}
                className={`text-sm ${u.is_active ? 'text-green-400' : 'text-white/40'} disabled:opacity-50`}
              >
                {u.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
