import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Shield } from 'lucide-react';
import {
  getStoredState,
  getStoredVerifier,
  clearOAuthState,
  saveSession,
  OIDCSession,
} from '../config';
import { exchangeCodeForTokens, validateIdToken, fetchUserInfo } from '../tokens';

export default function DemoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(`${errorParam}: ${errorDescription || 'Llave GT rechazó la solicitud.'}`);
        return;
      }

      if (!code) {
        setError('No se recibió código de autorización.');
        return;
      }

      const expectedState = getStoredState();
      if (!state || state !== expectedState) {
        setError('Validación de state fallida: el state no coincide. Posible ataque CSRF.');
        return;
      }

      const verifier = getStoredVerifier();
      if (!verifier) {
        setError('No se encontró el PKCE verifier en la sesión. Intenta iniciar sesión de nuevo.');
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(code, verifier);

        const claims = await validateIdToken(tokens.id_token);

        let userInfo = { sub: claims.sub, email: claims.email, name: claims.name };
        try {
          const fetched = await fetchUserInfo(tokens.access_token);
          userInfo = {
            sub: fetched.sub || claims.sub,
            email: fetched.email ?? claims.email,
            name: fetched.name ?? claims.name,
          };
        } catch {
          // UserInfo endpoint may not be available; fall back to ID token claims
        }

        const session: OIDCSession = {
          idToken: tokens.id_token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          userInfo,
          loginTime: new Date().toISOString(),
        };

        saveSession(session);
        clearOAuthState();
        navigate('/demo', { replace: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido durante el intercambio de tokens.';
        setError(msg);
      }
    })();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mb-2">Error de autenticación</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/demo', { replace: true })}
            className="text-sm text-teal-700 font-medium hover:underline"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-teal-600" />
        <p className="text-sm text-slate-500">Procesando autorización...</p>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <Shield size={12} />
          Validando ID token con JWKS...
        </div>
      </div>
    </div>
  );
}
