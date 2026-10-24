import { useEffect, useState } from 'react';
import { Shield, LogIn, Loader2, ArrowRight, Lock } from 'lucide-react';
import { buildAuthUrlAsync, getStoredSession, clearOAuthState, clearSession, OIDCSession } from '../config';
import AuthenticatedView from './AuthenticatedView';

export default function DemoWelcome() {
  const [redirecting, setRedirecting] = useState(false);
  const [session, setSession] = useState<OIDCSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored) {
      setSession(stored);
    }
    setChecked(true);
  }, []);

  const handleLogin = async () => {
    setRedirecting(true);
    clearOAuthState();
    const authUrl = await buildAuthUrlAsync();
    window.location.assign(authUrl);
  };

  const handleLogout = () => {
    clearOAuthState();
    clearSession();
    setSession(null);
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (session) {
    return <AuthenticatedView session={session} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App identity — deliberately different from Llave GT's teal */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Demo de Integración</h1>
          <p className="text-slate-400 text-sm mt-1">Aplicación cliente independiente</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Bienvenido</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Esta es una aplicación de demostración que utiliza Llave GT como proveedor de identidad.
            No tienes una cuenta aquí — tu identidad la gestiona Llave GT.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <Lock size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Al hacer clic en el botón, serás redirigido a Llave GT para iniciar sesión.
                Esta aplicación nunca ve tu contraseña.
              </p>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={redirecting}
            className="w-full flex items-center justify-center gap-2.5 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg px-6 py-3 text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redirecting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Redirigiendo a Llave GT...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Ingresar con Llave GT
              </>
            )}
          </button>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              Esta aplicación valida el ID token usando JWKS y firma RS256.
              No almacena contraseñas ni usa el access token como sustituto de identidad.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>Aplicación demo</span>
          <ArrowRight size={12} />
          <span>Llave GT (proveedor OIDC)</span>
        </div>
      </div>
    </div>
  );
}
