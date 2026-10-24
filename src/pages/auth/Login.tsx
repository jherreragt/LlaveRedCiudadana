import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError, needsVerification: shouldVerify } = await signIn(email, password);
    setLoading(false);
    if (shouldVerify) {
      const verifyRedirect = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : '';
      setNeedsVerification(true);
      return;
    }
    if (signInError) {
      setError(signInError);
    } else {
      navigate(redirectPath || '/dashboard');
    }
  };

  if (needsVerification) {
    const verifyLink = redirectPath
      ? `/verificar-correo?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectPath)}`
      : `/verificar-correo?email=${encodeURIComponent(email)}`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mail size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifica tu correo</h1>
            <p className="text-slate-400 text-sm mt-1">Tu cuenta aún no está confirmada</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Necesitas confirmar tu correo electrónico antes de iniciar sesión.
              Revisa tu bandeja de entrada en <strong className="text-slate-900">{email}</strong> y haz clic en el enlace de verificación.
            </p>
            <Link to={verifyLink}>
              <Button className="w-full mb-3">Reenviar correo de verificación</Button>
            </Link>
            <button
              onClick={() => setNeedsVerification(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Llave GT</h1>
          <p className="text-slate-400 text-sm mt-1">Tu identidad digital</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-slate-500 mb-6">Ingresa a tu cuenta</p>

          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
              icon={<Mail size={16} />}
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              icon={<Lock size={16} />}
            />

            <div className="flex justify-end">
              <Link to="/recuperar-contrasena" className="text-sm text-teal-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Ingresar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="text-teal-700 font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
