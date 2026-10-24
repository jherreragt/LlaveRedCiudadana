import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function VerifyEmail() {
  const { user, emailVerified, resendVerification } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') ?? user?.email ?? '');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (emailVerified && user) {
      navigate('/dashboard');
    }
  }, [emailVerified, user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setSending(true);
    setMessage(null);
    const { error } = await resendVerification(email);
    setSending(false);
    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({ type: 'success', text: 'Correo reenviado. Revisa tu bandeja de entrada y carpeta de spam.' });
      setCooldown(60);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verifica tu correo</h1>
          <p className="text-slate-400 text-sm mt-1">Llave GT Ciudadana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-teal-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Revisa tu correo</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Te enviamos un enlace de verificación. Haz clic en él para activar tu cuenta.
              Si no lo encuentras, revisa tu carpeta de spam.
            </p>
          </div>

          {message && (
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
              className="mb-4"
            />
          )}

          <div className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              placeholder="tu@correo.com"
            />

            <Button
              onClick={handleResend}
              loading={sending}
              disabled={cooldown > 0}
              className="w-full"
              icon={cooldown > 0 ? undefined : <ArrowRight size={16} />}
            >
              {cooldown > 0
                ? `Reenviar en ${cooldown}s`
                : 'Reenviar correo de verificación'}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">
              ¿Ya verificaste tu correo?
            </p>
            <Link to="/ingresar" className="block">
              <Button variant="outline" className="w-full">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
