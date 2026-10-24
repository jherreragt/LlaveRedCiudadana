import { Code2, Shield, KeyRound, Globe, Copy, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const endpoints = [
  { label: 'Authorization endpoint', value: 'https://<project-ref>.supabase.co/auth/v1/authorize' },
  { label: 'Token endpoint', value: 'https://<project-ref>.supabase.co/auth/v1/oauth/token' },
  { label: 'JWKS endpoint', value: 'https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json' },
  { label: 'OIDC Discovery', value: 'https://<project-ref>.supabase.co/auth/v1/.well-known/openid-configuration' },
  { label: 'UserInfo endpoint', value: 'https://<project-ref>.supabase.co/auth/v1/userinfo' },
];

const scopes = [
  { name: 'openid', desc: 'Solicita un ID token que verifica la identidad del usuario.' },
  { name: 'email', desc: 'Incluye el correo electrónico verificado del usuario en el token.' },
  { name: 'profile', desc: 'Incluye nombre completo y datos básicos del perfil.' },
];

const steps = [
  { num: '1', title: 'Registra tu aplicación', desc: 'Un administrador de Llave GT registra tu aplicación en el panel de administración, proporcionando nombre, URIs de redirección y tipo de cliente (público o confidencial).' },
  { num: '2', title: 'Construye la URL de autorización', desc: 'Redirige al usuario a la URL de autorización con client_id, redirect_uri, response_type=code, scope, state y code_challenge (PKCE S256).' },
  { num: '3', title: 'Usuario autoriza en Llave GT', desc: 'El usuario inicia sesión en Llave GT y ve una pantalla de consentimiento mostrando tu aplicación y los permisos solicitados. Puede aprobar o rechazar.' },
  { num: '4', title: 'Intercambia el código por tokens', desc: 'Recibes un authorization code en tu redirect_uri. Intercámabialo por access_token e id_token en el token endpoint.' },
  { num: '5', title: 'Valida el ID token', desc: 'Verifica la firma usando JWKS, y valida iss, aud, exp y nonce. Usa el UserInfo endpoint para obtener datos actualizados del perfil.' },
];

export default function Developers() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const authUrlExample = `https://<project-ref>.supabase.co/auth/v1/authorize
  ?client_id=TU_CLIENT_ID
  &redirect_uri=https://tu-app.com/callback
  &response_type=code
  &scope=openid email profile
  &state=valor_aleatorio_opaco
  &code_challenge=HASH_S256_DEL_VERIFIER
  &code_challenge_method=S256`;

  const tokenExample = `POST https://<project-ref>.supabase.co/auth/v1/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=TU_CLIENT_ID
&client_secret=TU_CLIENT_SECRET  // solo clientes confidenciales
&code=AUTHORIZATION_CODE
&redirect_uri=https://tu-app.com/callback
&code_verifier=PKCE_VERIFIER_ORIGINAL`;

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-600/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
            <Code2 size={14} />
            Para desarrolladores
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Ingresar con Llave GT
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Integra Llave GT como proveedor de identidad OAuth 2.1 / OpenID Connect en tus
            aplicaciones. Permite a tus usuarios ingresar con una identidad digital verificada.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Cómo funciona?</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Llave GT utiliza el servidor OAuth 2.1 / OpenID Connect nativo de Supabase Auth.
          Soporta Authorization Code Flow con PKCE (S256), el flujo recomendado para aplicaciones
          web, móviles y de servidor. Los tokens JWT se firman con claves asimétricas (RS256)
          y pueden validarse mediante el endpoint JWKS público.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <Shield size={20} className="text-teal-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">OAuth 2.1 + OIDC</h3>
            <p className="text-xs text-slate-500 mt-1">Estándar moderno con PKCE obligatorio.</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <KeyRound size={20} className="text-teal-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">JWT con RS256</h3>
            <p className="text-xs text-slate-500 mt-1">Firma asimétrica validable vía JWKS.</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <Lock size={20} className="text-teal-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">RLS por client_id</h3>
            <p className="text-xs text-slate-500 mt-1">Control de acceso a nivel de base de datos.</p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-slate-50 border-y border-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Pasos para integrar</h2>
          <div className="space-y-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-5 items-start">
                <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                  {num}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Endpoints OAuth / OIDC</h2>
        <div className="space-y-3">
          {endpoints.map((ep) => (
            <div key={ep.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">{ep.label}</p>
                <p className="text-sm font-mono text-slate-800 truncate">{ep.value}</p>
              </div>
              <button
                onClick={() => copy(ep.value, ep.label)}
                className="text-slate-400 hover:text-teal-600 shrink-0"
                aria-label={`Copiar ${ep.label}`}
              >
                {copied === ep.label ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Reemplaza <span className="font-mono">&lt;project-ref&gt;</span> con el identificador del proyecto Supabase de Llave GT.
        </p>
      </section>

      {/* Scopes */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Scopes soportados</h2>
        <div className="space-y-3">
          {scopes.map((s) => (
            <div key={s.name} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <p className="font-mono text-sm text-teal-700 font-medium">{s.name}</p>
              <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code examples */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">Ejemplos de integración</h2>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-teal-400 mb-3">URL de autorización (con PKCE S256)</h3>
            <div className="bg-slate-800 rounded-xl p-4 overflow-x-auto relative">
              <button
                onClick={() => copy(authUrlExample, 'authUrl')}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                aria-label="Copiar código"
              >
                {copied === 'authUrl' ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all pr-8">{authUrlExample}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-teal-400 mb-3">Intercambio de código por tokens</h3>
            <div className="bg-slate-800 rounded-xl p-4 overflow-x-auto relative">
              <button
                onClick={() => copy(tokenExample, 'token')}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                aria-label="Copiar código"
              >
                {copied === 'token' ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-all pr-8">{tokenExample}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Security notes */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Seguridad</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <CheckCircle size={20} className="text-emerald-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">PKCE S256 obligatorio</h3>
            <p className="text-xs text-slate-500 mt-1">Todos los clientes deben usar code_challenge con método S256.</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <Shield size={20} className="text-teal-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">Validación de state</h3>
            <p className="text-xs text-slate-500 mt-1">Usa un valor state aleatorio y validarlo al recibir la respuesta.</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <KeyRound size={20} className="text-amber-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">Redirect URIs exactas</h3>
            <p className="text-xs text-slate-500 mt-1">Solo las URIs registradas son aceptadas. Sin wildcards.</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <Globe size={20} className="text-blue-600 mb-2" />
            <h3 className="font-medium text-slate-900 text-sm">Validación de token</h3>
            <p className="text-xs text-slate-500 mt-1">Verifica iss, aud, exp y firma mediante JWKS en cada token.</p>
          </div>
        </div>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-medium text-amber-900 text-sm mb-2">Importante sobre RLS</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Los scopes OIDC controlan qué datos se incluyen en los tokens, pero NO controlan el acceso
            a tablas de la base de datos. Llave GT mantiene políticas RLS específicas que restringen
            el acceso de tokens OAuth a las tablas internas. Una aplicación externa no puede consultar
            datos privados de Llave GT ni de otras aplicaciones mediante tokens federados.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para integrar?</h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Contacta al equipo de Red Ciudadana para registrar tu aplicación como cliente OAuth.
          </p>
          <Button size="lg" onClick={() => navigate('/registro')} className="bg-white text-teal-700 hover:bg-teal-50" icon={<ArrowRight size={18} />}>
            Crear cuenta de desarrollador
          </Button>
          <Button size="lg" variant="ghost" onClick={() => navigate('/demo')} className="text-white hover:bg-teal-600 border border-white/30">
            Ver demo de integración
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
