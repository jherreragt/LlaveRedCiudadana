import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

interface AuthorizationDetails {
  authorization_id?: string;
  client_id?: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  redirect_uri?: string;
  scope?: string;
  user_id?: string;
  email?: string;
}

const scopeDescriptions: Record<string, { label: string; desc: string }> = {
  openid: { label: 'Verificar tu identidad', desc: 'Confirma que tienes una cuenta Llave GT válida.' },
  email: { label: 'Tu correo electrónico', desc: 'Permite a la aplicación ver tu correo verificado.' },
  profile: { label: 'Tu información de perfil', desc: 'Permite acceder a tu nombre y datos básicos de perfil.' },
  phone: { label: 'Tu número de teléfono', desc: 'Permite a la aplicación ver tu número de teléfono.' },
};

export default function OAuthConsent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, emailVerified, loading: authLoading } = useAuth();
  const authorizationId = searchParams.get('authorization_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [autoRedirected, setAutoRedirected] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'deny' | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!authorizationId) {
      setError('Falta el parámetro authorization_id. Esta página solo es accesible desde un flujo OAuth.');
      setLoading(false);
      return;
    }
    if (!user) {
      const returnUrl = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
      navigate(`/ingresar?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }
    if (!emailVerified) {
      const returnUrl = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
      navigate(`/verificar-correo?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    (async () => {
      const { data, error: err } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (err) {
        setError(err.message || 'No se pudieron obtener los detalles de autorización.');
        setLoading(false);
        return;
      }
      if (data && !('authorization_id' in data) && (data as { redirect_url?: string }).redirect_url) {
        setAutoRedirected(true);
        window.location.assign((data as { redirect_url: string }).redirect_url);
        return;
      }
      setDetails(data as AuthorizationDetails);
      setLoading(false);
    })();
  }, [authorizationId, user, emailVerified, authLoading, navigate]);

  const handleApprove = async () => {
    if (!authorizationId) return;
    setDecision('approve');
    setDecisionLoading(true);
    const { data, error: err } = await supabase.auth.oauth.approveAuthorization(authorizationId, {
      skipBrowserRedirect: true,
    });
    if (err) {
      setError(err.message || 'No se pudo aprobar la autorización.');
      setDecisionLoading(false);
      return;
    }
    if (data?.redirect_url) {
      window.location.assign(data.redirect_url);
    } else {
      setError('No se recibió URL de redirección tras la aprobación.');
      setDecisionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!authorizationId) return;
    setDecision('deny');
    setDecisionLoading(true);
    const { data, error: err } = await supabase.auth.oauth.denyAuthorization(authorizationId, {
      skipBrowserRedirect: true,
    });
    if (err) {
      setError(err.message || 'No se pudo denegar la autorización.');
      setDecisionLoading(false);
      return;
    }
    if (data?.redirect_url) {
      window.location.assign(data.redirect_url);
    } else {
      setError('No se recibió URL de redirección tras la denegación.');
      setDecisionLoading(false);
    }
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-teal-600" />
          <p className="text-sm text-slate-500">Verificando solicitud de autorización...</p>
        </div>
      </div>
    );
  }

  if (autoRedirected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <CheckCircle size={32} className="text-emerald-500" />
          <p className="text-sm text-slate-500">Ya autorizaste esta aplicación. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 mb-2">Error de autorización</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  const scopes = details.scope ? details.scope.split(' ').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-teal-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Llave GT</h1>
          <p className="text-xs text-slate-500">Autorización de acceso</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
          {/* Client info */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              {details.logo_uri ? (
                <img src={details.logo_uri} alt="" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <Shield size={20} />
                </div>
              )}
              <ArrowRight size={20} className="text-slate-300" />
              <div className="w-12 h-12 bg-teal-700 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {details.client_name || 'Una aplicación'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              solicita acceso a tu cuenta Llave GT
            </p>
            {details.client_uri && (
              <a
                href={details.client_uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:underline mt-1 inline-block"
              >
                {details.client_uri}
              </a>
            )}
          </div>

          {/* Scopes */}
          {scopes.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-medium text-slate-700 mb-3">
                Esta aplicación podrá acceder a:
              </p>
              <ul className="space-y-2.5" role="list">
                {scopes.map((scope) => {
                  const info = scopeDescriptions[scope];
                  return (
                    <li key={scope} className="flex items-start gap-2.5">
                      <CheckCircle size={16} className="text-teal-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {info?.label || scope}
                        </p>
                        {info?.desc && (
                          <p className="text-xs text-slate-500 mt-0.5">{info.desc}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Redirect URI info */}
          {details.redirect_uri && (
            <div className="mb-6">
              <p className="text-xs text-slate-400">
                Serás redirigido a: <span className="font-mono text-slate-600">{details.redirect_uri}</span>
              </p>
            </div>
          )}

          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl mb-6">
            <div className="w-9 h-9 bg-teal-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Conectado como</p>
              <p className="text-xs text-slate-600 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              loading={decisionLoading && decision === 'approve'}
              onClick={handleApprove}
              icon={<CheckCircle size={18} />}
            >
              Autorizar acceso
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              loading={decisionLoading && decision === 'deny'}
              onClick={handleDeny}
              icon={<XCircle size={18} />}
            >
              Rechazar
            </Button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-5">
            Puedes revocar este acceso en cualquier momento desde tu panel de aplicaciones conectadas.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Llave GT · Un proyecto de Red Ciudadana
        </p>
      </div>
    </div>
  );
}
