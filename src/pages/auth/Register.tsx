import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, Briefcase, Globe, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    phone: '', organization: '', job_title: '', country: '', city: '',
  });

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
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.full_name,
      phone: form.phone,
      organization: form.organization,
      job_title: form.job_title,
      country: form.country,
      city: form.city,
    });
    setLoading(false);
    if (error) {
      const msg = (error as { message?: string }).message ?? '';
      if (msg.includes('already registered')) {
        setError('Este correo ya está registrado. Intenta ingresar o recuperar tu contraseña.');
      } else {
        setError('Ocurrió un error al crear tu cuenta. Intenta de nuevo.');
      }
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mt-1">LlaveRed Ciudadana — Escuela Red Ciudadana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">¡Cuenta creada!</h3>
              <p className="text-slate-500 text-sm mt-2">Redirigiendo a tu portal...</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Información personal</h2>
              <p className="text-sm text-slate-500 mb-6">Completa tu perfil institucional</p>

              {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nombre completo" value={form.full_name} onChange={set('full_name')} required icon={<User size={16} />} placeholder="Ana García" />
                  <Input label="Correo electrónico" type="email" value={form.email} onChange={set('email')} required icon={<Mail size={16} />} placeholder="ana@correo.com" />
                  <Input label="Contraseña" type="password" value={form.password} onChange={set('password')} required icon={<Lock size={16} />} placeholder="Mínimo 8 caracteres" />
                  <Input label="Confirmar contraseña" type="password" value={form.confirm_password} onChange={set('confirm_password')} required icon={<Lock size={16} />} placeholder="Repite tu contraseña" />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Información institucional (opcional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Teléfono" type="tel" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} placeholder="+52 55 0000 0000" />
                    <Input label="Organización" value={form.organization} onChange={set('organization')} icon={<Building2 size={16} />} placeholder="Tu organización" />
                    <Input label="Cargo o función" value={form.job_title} onChange={set('job_title')} icon={<Briefcase size={16} />} placeholder="Coordinador, Director..." />
                    <Input label="País" value={form.country} onChange={set('country')} icon={<Globe size={16} />} placeholder="México" />
                    <Input label="Ciudad" value={form.city} onChange={set('city')} icon={<MapPin size={16} />} placeholder="Ciudad de México" className="sm:col-span-1" />
                  </div>
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
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
