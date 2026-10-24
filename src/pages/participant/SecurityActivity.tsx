import { useEffect, useState } from 'react';
import { Activity, LogIn, LogOut, KeyRound, Mail, Shield, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/utils';
import type { SecurityEvent } from '../../lib/types';

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

export default function SecurityActivity() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setEvents((data ?? []) as SecurityEvent[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Actividad de seguridad</h1>
          <p className="text-slate-500 text-sm mt-1">
            Registro de eventos importantes en tu cuenta. Se muestran los últimos 50 eventos.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <EmptyState
              icon={<Activity size={28} />}
              title="Sin actividad registrada"
              description="Cuando ocurran eventos importantes en tu cuenta, aparecerán aquí."
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-50" role="list">
              {events.map((event) => {
                const cfg = eventIcons[event.event_type] ?? { icon: Activity, color: 'text-slate-600 bg-slate-100' };
                const Icon = cfg.icon;
                return (
                  <li key={event.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {eventLabels[event.event_type] ?? event.event_type}
                      </p>
                      {event.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>{formatDateTime(event.created_at)}</span>
                        {event.ip_address && <span>IP: {event.ip_address}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
