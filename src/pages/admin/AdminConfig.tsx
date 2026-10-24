import { useEffect, useState } from 'react';
import { Settings, Shield, Building2, KeyRound, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { supabase } from '../../lib/supabase';


export default function AdminConfig() {
  const [stats, setStats] = useState({ totalApps: 0, activeApps: 0, totalEvents: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [appsRes, activeAppsRes, eventsRes, usersRes] = await Promise.all([
        supabase.from('connected_apps').select('*', { count: 'exact', head: true }),
        supabase.from('connected_apps').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('security_events').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        totalApps: appsRes.count ?? 0,
        activeApps: activeAppsRes.count ?? 0,
        totalEvents: eventsRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="text-slate-400">Cargando...</div></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-500 text-sm mt-1">Información general y configuración del sistema.</p>
      </div>

      {saved && <Alert type="success" message="Configuración guardada." onClose={() => setSaved(false)} className="mb-4" />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OAuth Server status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <KeyRound size={18} className="text-teal-600" /> Servidor OAuth 2.1 / OIDC
          </h2>
          <div className="space-y-3">
            <ConfigRow label="Estado" value="Configuración manual requerida" />
            <ConfigRow label="Ruta de autorización" value="/oauth/consent" />
            <ConfigRow label="Flow soportado" value="Authorization Code + PKCE S256" />
            <ConfigRow label="Scopes" value="openid, email, profile" />
            <ConfigRow label="Firma JWT" value="RS256 (asimétrica)" />
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-900">Configuración manual en Supabase Dashboard</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Para activar el servidor OAuth, un administrador de Supabase debe:
                </p>
                <ol className="text-xs text-amber-700 mt-1.5 space-y-1 list-decimal list-inside">
                  <li>Ir a Authentication &gt; OAuth Server</li>
                  <li>Establecer Authorization Path en <span className="font-mono">/oauth/consent</span></li>
                  <li>Migrar las claves JWT a RS256 o ES256 en Authentication &gt; JWT Keys</li>
                  <li>Registrar clientes OAuth en Authentication &gt; OAuth Apps</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* System info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-teal-600" /> Información del sistema
          </h2>
          <div className="space-y-3">
            <ConfigRow label="Nombre del sistema" value="Llave GT" />
            <ConfigRow label="Institución" value="Red Ciudadana" />
            <ConfigRow label="País" value="Guatemala" />
            <ConfigRow label="Aplicaciones conectadas" value={`${stats.totalApps} (${stats.activeApps} activas)`} />
            <ConfigRow label="Eventos de seguridad registrados" value={String(stats.totalEvents)} />
            <ConfigRow label="Usuarios totales" value={String(stats.totalUsers)} />
          </div>
        </div>

        {/* Institutional identity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-teal-600" /> Identidad institucional
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del sistema</label>
              <input
                value="Llave GT"
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm px-3 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <textarea
                value="Tu identidad digital para acceder a servicios y plataformas de manera sencilla y segura."
                disabled
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm px-3 py-2.5 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institución</label>
              <input
                value="Red Ciudadana"
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm px-3 py-2.5"
              />
            </div>
            <p className="text-xs text-slate-400">
              La identidad institucional se configura a nivel de plataforma y no es editable desde esta pantalla.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
