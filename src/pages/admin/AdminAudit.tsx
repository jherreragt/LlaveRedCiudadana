import { useEffect, useState } from 'react';
import { ScrollText, Search, LogIn, LogOut, KeyRound, Mail, Shield, Monitor, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import { formatDateTime } from '../../lib/utils';
import type { Profile, SecurityEvent } from '../../lib/types';

interface AuditRow extends SecurityEvent {
  profile: { full_name: string; email: string } | null;
}

const eventIcons: Record<string, { icon: typeof LogIn; color: string }> = {
  login: { icon: LogIn, color: 'text-emerald-600 bg-emerald-50' },
  logout: { icon: LogOut, color: 'text-slate-600 bg-slate-100' },
  password_change: { icon: KeyRound, color: 'text-amber-600 bg-amber-50' },
  email_change: { icon: Mail, color: 'text-blue-600 bg-blue-50' },
  app_authorized: { icon: Shield, color: 'text-teal-600 bg-teal-50' },
  app_revoked: { icon: Shield, color: 'text-red-600 bg-red-50' },
  session_revoked: { icon: Monitor, color: 'text-red-600 bg-red-50' },
};

const eventLabels: Record<string, string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  password_change: 'Cambio de contraseña',
  email_change: 'Cambio de correo',
  app_authorized: 'Aplicación autorizada',
  app_revoked: 'Aplicación revocada',
  session_revoked: 'Sesión revocada',
};

export default function AdminAudit() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('security_events')
        .select('*, profile:profiles!security_events_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(200);
      setEvents((data ?? []) as unknown as AuditRow[]);
      setLoading(false);
    })();
  }, []);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (e.profile?.full_name?.toLowerCase().includes(q) ?? false) ||
      (e.profile?.email?.toLowerCase().includes(q) ?? false) ||
      e.event_type.toLowerCase().includes(q);
    const matchType = !typeFilter || e.event_type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Auditoría</h1>
        <p className="text-slate-500 text-sm mt-1">Registro de eventos de seguridad del sistema. Últimos 200 eventos.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar por usuario, correo o tipo de evento..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={15} />} />
        </div>
        <Select
          options={[
            { value: '', label: 'Todos los tipos' },
            { value: 'login', label: 'Inicio de sesión' },
            { value: 'logout', label: 'Cierre de sesión' },
            { value: 'password_change', label: 'Cambio de contraseña' },
            { value: 'email_change', label: 'Cambio de correo' },
            { value: 'app_authorized', label: 'App autorizada' },
            { value: 'app_revoked', label: 'App revocada' },
            { value: 'session_revoked', label: 'Sesión revocada' },
          ]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-auto min-w-[180px]"
          label=""
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={<ScrollText size={28} />}
            title="Sin eventos de auditoría"
            description="No se encontraron eventos con los filtros aplicados."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Usuario</th>
                  <th className="text-left px-4 py-3">Evento</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Descripción</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">IP</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((e) => {
                  const cfg = eventIcons[e.event_type] ?? { icon: Activity, color: 'text-slate-600 bg-slate-100' };
                  const Icon = cfg.icon;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{e.profile?.full_name ?? '—'}</p>
                        <p className="text-xs text-slate-400">{e.profile?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                            <Icon size={12} />
                          </div>
                          <span className="text-slate-700">{eventLabels[e.event_type] ?? e.event_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs truncate">{e.description || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell font-mono text-xs">{e.ip_address || '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(e.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
