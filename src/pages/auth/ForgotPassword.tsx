import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('Demasiados intentos. Espera unos minutos antes de solicitar otro enlace.');
      } else {
        setError('No pudimos enviar el correo. Verifica la dirección e intenta de nuevo.');
      }
    } else {
      setSent(true);
      setCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Correo enviado</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Revisa tu bandeja de entrada en <strong className="text-slate-900">{email}</strong> y sigue las instrucciones para crear una nueva contraseña.
                El enlace expirará en breve, úsalo cuanto antes.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setSent(false); setCooldown(0); }}
                >
                  Usar otro correo
                </Button>
                <Link to="/ingresar" className="block text-sm text-teal-700 font-medium hover:underline">
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Restablece tu contraseña</h2>
              <p className="text-sm text-slate-500 mb-6">
                Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon={<Mail size={16} />}
                  placeholder="tu@correo.com"
                />
                <Button type="submit" className="w-full" loading={loading} disabled={cooldown > 0}>
                  {cooldown > 0 ? `Espera ${cooldown}s` : 'Enviar enlace de recuperación'}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm">
                <Link to="/ingresar" className="text-teal-700 font-medium hover:underline">
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
