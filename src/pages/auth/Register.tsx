import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!acceptedTerms) {
      setError('Debes aceptar el aviso de privacidad y los términos para continuar.');
      return;
    }
    setLoading(true);
    const { error: signUpError, needsVerification: shouldVerify } = await signUp(
      form.email, form.password, form.full_name
    );
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
    } else if (shouldVerify) {
      setRegisteredEmail(form.email);
      setNeedsVerification(true);
    } else {
      navigate('/dashboard');
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Llave GT Ciudadana</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Verifica tu correo</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Hemos enviado un correo de confirmación a <strong className="text-slate-900">{registeredEmail}</strong>.
              Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para verificar tu cuenta.
            </p>
            <Link to="/verificar-correo">
              <Button className="w-full mb-3">Ir a la pantalla de verificación</Button>
            </Link>
            <Link to="/ingresar" className="text-sm text-teal-700 font-medium hover:underline">
              Ya verifiqué mi correo — Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-1">Llave GT — Identidad Ciudadana Digital</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Información personal</h2>
          <p className="text-sm text-slate-500 mb-6">Crea tu identidad digital ciudadana</p>

          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nombre completo" value={form.full_name} onChange={set('full_name')} required icon={<User size={16} />} placeholder="Ana García" />
            <Input label="Correo electrónico" type="email" value={form.email} onChange={set('email')} required icon={<Mail size={16} />} placeholder="ana@correo.com" />
            <div className="grid grid-cols-1 gap-4">
              <Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required icon={<Lock size={16} />} placeholder="Mínimo 8 caracteres" />
              <Input label="Confirmar contraseña" type="password" value={form.confirm_password} onChange={set('confirm_password')} required icon={<Lock size={16} />} placeholder="Repite tu contraseña" />
            </div>

            {/* Terms acceptance */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Acepto el <a href="#" className="text-teal-700 font-medium hover:underline">aviso de privacidad</a> y los{' '}
                  <a href="#" className="text-teal-700 font-medium hover:underline">términos y condiciones</a> de Llave GT Ciudadana.
                  Mis datos serán tratados conforme a la legislación aplicable.
                </span>
              </label>
            </div>

            <Button type="submit" className="w-full" loading={loading} size="lg">
              Crear mi cuenta
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/ingresar" className="text-teal-700 font-medium hover:underline">
              Ingresar aquí
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
