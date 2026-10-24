import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Shield, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import type { Profile } from '../../lib/types';

interface DashStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  admins: number;
  coordinators: number;
  participants: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashStats>({
    totalUsers: 0, activeUsers: 0, inactiveUsers: 0, admins: 0, coordinators: 0, participants: 0,
  });
  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: total },
        { count: active },
        { count: admins },
        { count: coordinators },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coordinator'),
      ]);

      const { data: recent } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: total ?? 0,
        activeUsers: active ?? 0,
        inactiveUsers: (total ?? 0) - (active ?? 0),
        admins: admins ?? 0,
        coordinators: coordinators ?? 0,
        participants: (total ?? 0) - (admins ?? 0) - (coordinators ?? 0),
      });
      setRecentUsers(recent ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen del sistema Llave GT Ciudadana</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
        <AdminStat icon={<Users size={20} />} label="Total usuarios" value={stats.totalUsers} color="teal" />
        <AdminStat icon={<UserCheck size={20} />} label="Activos" value={stats.activeUsers} color="emerald" />
        <AdminStat icon={<UserX size={20} />} label="Inactivos" value={stats.inactiveUsers} color="red" />
        <AdminStat icon={<Shield size={20} />} label="Admins" value={stats.admins} color="blue" />
        <AdminStat icon={<Shield size={20} />} label="Coordinadores" value={stats.coordinators} color="amber" />
        <AdminStat icon={<Users size={20} />} label="Participantes" value={stats.participants} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-teal-600" /> Distribución de roles
          </h2>
          <p className="text-sm text-slate-500 mb-5">Composición de la base de usuarios</p>
          <div className="space-y-4">
            <RoleBar label="Participantes" value={stats.participants} max={Math.max(stats.totalUsers, 1)} color="bg-slate-500" />
            <RoleBar label="Coordinadores" value={stats.coordinators} max={Math.max(stats.totalUsers, 1)} color="bg-amber-500" />
            <RoleBar label="Administradores" value={stats.admins} max={Math.max(stats.totalUsers, 1)} color="bg-teal-500" />
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Users size={18} className="text-blue-600" /> Usuarios recientes
          </h2>
          <p className="text-sm text-slate-500 mb-5">Últimos registros en el sistema</p>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No hay usuarios registrados.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                    {(u.full_name || u.email || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{u.full_name || '—'}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-medium ${u.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-100 text-slate-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className={`w-10 h-10 ${colorMap[color]} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function RoleBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{value} {value === 1 ? 'usuario' : 'usuarios'}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
