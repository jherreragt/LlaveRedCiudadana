import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Briefcase, Globe, MapPin, Save,
  KeyRound, CheckCircle, Copy, Clock, MailCheck, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { getInitials, formatDate } from '../../lib/utils';
import { statusBadge } from '../../components/ui/Badge';

export default function Profile() {
  const { user, profile, loading: authLoading, emailVerified, refreshProfile, updateEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', organization: '', job_title: '', country: '', city: '',
  });

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        organization: profile.organization ?? '',
        job_title: profile.job_title ?? '',
        country: profile.country ?? '',
        city: profile.city ?? '',
      });
    }
  }, [profile]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    if (!form.full_name.trim()) { setError('El nombre completo es obligatorio.'); return; }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', profile!.id);
    setLoading(false);
    if (error) {
      setError('No se pudo guardar el perfil. Intenta de nuevo.');
    } else {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleEmailChange = async () => {
    setEmailChangeError('');
    setEmailChangeSuccess(false);
    if (!newEmail.trim()) { setEmailChangeError('Ingresa un correo válido.'); return; }
    if (newEmail === user?.email) { setEmailChangeError('El correo es el mismo que ya usas.'); return; }
    setEmailChangeLoading(true);
    const { error, needsVerification } = await updateEmail(newEmail);
    setEmailChangeLoading(false);
    if (error) {
      setEmailChangeError(error);
    } else if (needsVerification) {
      setEmailChangeSuccess(true);
    } else {
      setEmailModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const copyUuid = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Datos personales</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona tu información personal y de identidad.</p>
        </div>

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5 mb-5">
            <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
              {getInitials(profile?.full_name ?? 'U')}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 text-lg">{profile?.full_name || '—'}</h2>
              <p className="text-slate-500 text-sm">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {statusBadge(profile?.role ?? 'participant')}
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <MailCheck size={12} /> Correo verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle size={12} /> Correo sin verificar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Identity details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <KeyRound size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Identificador (UUID)</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-slate-700 truncate">{user?.id}</p>
                  <button onClick={copyUuid} className="text-slate-400 hover:text-teal-600 shrink-0" aria-label="Copiar identificador">
                    {copied ? <CheckCircle size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
              <Clock size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Cuenta creada</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(profile?.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Información personal</h3>

          {saved && <Alert type="success" message="Perfil actualizado correctamente." className="mb-4" />}
          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-4" />}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre completo" value={form.full_name} onChange={set('full_name')} required icon={<User size={16} />} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
                <div className="flex gap-2">
                  <input
                    value={profile?.email ?? ''}
                    disabled
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm pl-3 pr-3 py-2.5"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => { setNewEmail(''); setEmailChangeError(''); setEmailChangeSuccess(false); setEmailModalOpen(true); }}>
                    Cambiar
                  </Button>
                </div>
                {emailVerified ? (
                  <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1"><MailCheck size={11} /> Verificado</p>
                ) : (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={11} /> Sin verificar</p>
                )}
              </div>
              <Input label="Teléfono" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} placeholder="+502 5555 0000" />
              <Input label="Organización" value={form.organization} onChange={set('organization')} icon={<Building2 size={16} />} />
              <Input label="Cargo o función" value={form.job_title} onChange={set('job_title')} icon={<Briefcase size={16} />} />
              <Input label="País" value={form.country} onChange={set('country')} icon={<Globe size={16} />} />
              <Input label="Ciudad" value={form.city} onChange={set('city')} icon={<MapPin size={16} />} className="sm:col-span-1" />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={loading} icon={<Save size={16} />}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Email change modal */}
      <Modal open={emailModalOpen} onClose={() => setEmailModalOpen(false)} title="Cambiar correo electrónico" size="sm">
        {emailChangeSuccess ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MailCheck size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Verifica tu nuevo correo</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hemos enviado un enlace de confirmación a <strong>{newEmail}</strong>.
              Debes verificarlo desde el correo antes de que el cambio sea efectivo.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Tu correo actual es <strong className="text-slate-900">{user?.email}</strong>.
              Ingresa el nuevo correo y te enviaremos un enlace de confirmación.
            </p>
            {emailChangeError && <Alert type="error" message={emailChangeError} onClose={() => setEmailChangeError('')} />}
            <Input
              label="Nuevo correo electrónico"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              icon={<Mail size={16} />}
              placeholder="nuevo@correo.com"
            />
            <div className="flex gap-2 pt-2">
              <Button onClick={handleEmailChange} loading={emailChangeLoading}>Enviar confirmación</Button>
              <Button variant="ghost" onClick={() => setEmailModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
