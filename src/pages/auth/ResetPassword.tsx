import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setHasRecoverySession(true);
      }
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('weak') || msg.includes('password')) {
        setError('La contraseña es demasiado débil. Usa al menos 8 caracteres con letras y números.');
      } else {
        setError('No pudimos actualizar tu contraseña. El enlace puede haber expirado — solicita uno nuevo.');
      }
    } else {
      setSuccess(true);
      setTimeout(() => {
        supabase.auth.signOut().then(() => navigate('/ingresar'));
      }, 3000);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-slate-400 text-sm">Verificando enlace de recuperación...</div>
      </div>
    );
  }

  if (!hasRecoverySession && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Enlace inválido o expirado</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              El enlace de recuperación no es válido o ya expiró.
              Solicita uno nuevo para restablecer tu contraseña.
            </p>
            <Link to="/recuperar-contrasena">
              <Button className="w-full">Solicitar nuevo enlace</Button>
            </Link>
            <Link to="/ingresar" className="mt-4 block text-sm text-slate-500 hover:text-slate-700">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-slate-400 text-sm mt-1">Llave GT Ciudadana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Contraseña actualizada</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tu contraseña se ha cambiado correctamente. Te redirigiremos al inicio de sesión.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Crea una nueva contraseña</h2>
              <p className="text-sm text-slate-500 mb-6">Tu contraseña anterior ya no es válida.</p>

              {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock size={16} />}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
                <Input
                  label="Confirmar contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  icon={<Lock size={16} />}
                  placeholder="Repite tu nueva contraseña"
                  autoComplete="new-password"
                />
                <Button type="submit" className="w-full" loading={loading} icon={<ArrowRight size={16} />}>
                  Actualizar contraseña
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
