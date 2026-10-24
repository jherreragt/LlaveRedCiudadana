import { useEffect, useState } from 'react';
import { Plug, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { formatDateTime } from '../../lib/utils';
import type { ConnectedApp, UserAppConnection, AppConnectionWithApp } from '../../lib/types';

export default function ConnectedApps() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<AppConnectionWithApp[]>([]);
  const [availableApps, setAvailableApps] = useState<ConnectedApp[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const [connRes, appsRes] = await Promise.all([
      supabase
        .from('user_app_connections')
        .select('*, app:connected_apps(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('connected_apps').select('*').eq('status', 'active').order('name'),
    ]);
    setConnections((connRes.data ?? []) as unknown as AppConnectionWithApp[]);
    setAvailableApps((appsRes.data ?? []) as ConnectedApp[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleConnect = async (appId: string) => {
    if (!user) return;
    setConnecting(appId);
    await supabase.from('user_app_connections').insert({
      user_id: user.id,
      app_id: appId,
      status: 'authorized',
      authorized_at: new Date().toISOString(),
    });
    setConnecting(null);
    load();
  };

  const handleRevoke = async (connectionId: string) => {
    setRevoking(connectionId);
    await supabase
      .from('user_app_connections')
      .update({ status: 'revoked', revoked_at: new Date().toISOString() })
      .eq('id', connectionId);
    setRevoking(null);
    load();
  };

  const connectedAppIds = connections
    .filter((c) => c.status === 'authorized' || c.status === 'pending')
    .map((c) => c.app_id);
  const notConnectedApps = availableApps.filter((a) => !connectedAppIds.includes(a.id));

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Aplicaciones conectadas</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestiona qué aplicaciones pueden acceder a tu identidad Llave GT.
          </p>
        </div>

        {/* Connected apps */}
        <div className="mb-8">
          <h2 className="font-semibold text-slate-900 mb-4">Aplicaciones autorizadas</h2>
          {connections.filter((c) => c.status === 'authorized').length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <EmptyState
                icon={<Plug size={28} />}
                title="Sin aplicaciones conectadas"
                description="Cuando autorices aplicaciones, aparecerán aquí."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {connections.filter((c) => c.status === 'authorized').map((conn) => (
                <div key={conn.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                    <Plug size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900">{conn.app?.name ?? 'Aplicación'}</h3>
                    <p className="text-xs text-slate-500 truncate">{conn.app?.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Autorizada el {formatDateTime(conn.authorized_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle size={14} /> Activa
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      loading={revoking === conn.id}
                      onClick={() => handleRevoke(conn.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Revocar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revoked apps */}
        {connections.filter((c) => c.status === 'revoked').length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-slate-900 mb-4">Aplicaciones revocadas</h2>
            <div className="space-y-3">
              {connections.filter((c) => c.status === 'revoked').map((conn) => (
                <div key={conn.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                    <Plug size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-600">{conn.app?.name ?? 'Aplicación'}</h3>
                    <p className="text-xs text-slate-400">Revocada el {formatDateTime(conn.revoked_at)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <XCircle size={14} /> Inactiva
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available apps */}
        {notConnectedApps.length > 0 && (
          <div>
            <h2 className="font-semibold text-slate-900 mb-4">Aplicaciones disponibles</h2>
            <div className="space-y-3">
              {notConnectedApps.map((app) => (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                    <Plug size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900">{app.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{app.description}</p>
                  </div>
                  <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    loading={connecting === app.id}
                    onClick={() => handleConnect(app.id)}
                  >
                    Conectar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
