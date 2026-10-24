import { Shield, LogOut, CheckCircle, User, Mail, KeyRound, Clock, Lock } from 'lucide-react';
import type { OIDCSession } from '../config';
import { formatDateTime } from '../../lib/utils';

interface Props {
  session: OIDCSession;
  onLogout: () => void;
}

export default function AuthenticatedView({ session, onLogout }: Props) {
  const { userInfo, loginTime, idToken } = session;

  // Decode the ID token header to show the algorithm (for display only, not validation)
  const tokenParts = idToken.split('.');
  let tokenAlg = '—';
  try {
    const header = JSON.parse(atob(tokenParts[0]));
    tokenAlg = header.alg || '—';
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* App identity */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Demo de Integración</h1>
          <p className="text-xs text-slate-500">Sesión iniciada vía Llave GT</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
          {/* Success indicator */}
          <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4 mb-6">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Identidad verificada</p>
              <p className="text-xs text-emerald-700">ID token validado con JWKS · RS256</p>
            </div>
          </div>

          {/* User info — only what the scopes permitted */}
          <h2 className="text-sm font-medium text-slate-700 mb-3">Tu información de identidad</h2>
          <div className="space-y-3 mb-6">
            <InfoRow icon={<User size={16} />} label="Nombre" value={userInfo.name || 'No disponible'} />
            <InfoRow icon={<Mail size={16} />} label="Correo verificado" value={userInfo.email || 'No disponible'} />
            <InfoRow icon={<KeyRound size={16} />} label="Identificador (sub)" value={userInfo.sub} mono />
            <InfoRow icon={<Clock size={16} />} label="Inicio de sesión" value={formatDateTime(loginTime)} />
          </div>

          {/* Token info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-medium text-slate-700 mb-2">Detalles del token</h3>
            <div className="space-y-1.5">
              <TokenRow label="Algoritmo de firma" value={tokenAlg} />
              <TokenRow label="Emisor (iss)" value="letjzluumsacjagsgdtn.supabase.co" />
              <TokenRow label="Validación" value="JWKS remoto + nonce + exp" />
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
            <Lock size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Esta aplicación no almacenó tu contraseña ni usó el access token como sustituto
              de tu identidad. La identidad se verificó exclusivamente mediante el ID token
              firmado por Llave GT.
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Demo de Integración · Aplicación cliente independiente de Llave GT
        </p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-medium text-slate-900 truncate ${mono ? 'font-mono text-xs' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function TokenRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
