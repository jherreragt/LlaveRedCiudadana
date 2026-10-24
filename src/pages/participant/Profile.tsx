import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Briefcase, Globe, MapPin, Save,
  Shield, KeyRound, Monitor, LogOut, CheckCircle, XCircle, Copy,
  Clock, AlertTriangle, MailCheck
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

type Tab = 'profile' | 'security';

export default function Profile() {
  const { user, profile, loading: authLoading, emailVerified, refreshProfile, updateEmail, updatePassword, signOut, signOutAll } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', phone: '', organization: '', job_title: '', country: '', city: '',
  });

  // Email change modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  // Password change modal
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Session management
  const [signOutAllLoading, setSignOutAllLoading] = useState(false);
  const [signOutAllMsg, setSignOutAllMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  const handlePasswordChange = async () => {
    setPwError('');
    setPwSuccess(false);
    if (pwForm.next !== pwForm.confirm) { setPwError('Las contraseñas no coinciden.'); return; }
    if (pwForm.next.length < 8) { setPwError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    setPwLoading(true);
    const { error } = await updatePassword(pwForm.current, pwForm.next);
    setPwLoading(false);
    if (error) {
      setPwError(error);
    } else {
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => { setPwModalOpen(false); setPwSuccess(false); }, 2500);
    }
  };

  const handleSignOutAll = async () => {
    setSignOutAllLoading(true);
    const { error } = await signOutAll();
    setSignOutAllLoading(false);
    if (error) {
      setSignOutAllMsg({ type: 'error', text: error });
    } else {
      setSignOutAllMsg({ type: 'success', text: 'Se han cerrado todas las sesiones.' });
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
          <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona tu identidad digital y seguridad.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-100 shadow-sm p-1">
          <button
            onClick={() => setTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User size={16} /> Información
          </button>
          <button
            onClick={() => setTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'security' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Shield size={16} /> Seguridad
          </button>
        </div>

        {tab === 'profile' && (
          <>
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
                      <button onClick={copyUuid} className="text-slate-400 hover:text-teal-600 shrink-0">
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
          </>
        )}

        {tab === 'security' && (
          <div className="space-y-6">
            {/* Verification status */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MailCheck size={18} className="text-teal-600" /> Estado de verificación
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center gap-3">
                    {emailVerified ? (
                      <CheckCircle size={18} className="text-emerald-500" />
                    ) : (
                      <XCircle size={18} className="text-red-400" />
                    )}
                    <span className="text-sm text-slate-700">Correo electrónico verificado</span>
                  </div>
                  {emailVerified ? (
                    <span className="text-xs text-emerald-600 font-medium">Verificado</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">Pendiente</span>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <KeyRound size={18} className="text-teal-600" /> Contraseña
              </h3>
              <p className="text-sm text-slate-500 mb-4">Cambia tu contraseña periódicamente para mayor seguridad.</p>
              <Button variant="outline" icon={<KeyRound size={15} />} onClick={() => { setPwForm({ current: '', next: '', confirm: '' }); setPwError(''); setPwSuccess(false); setPwModalOpen(true); }}>
                Cambiar contraseña
              </Button>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Monitor size={18} className="text-teal-600" /> Sesiones activas
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Cierra la sesión actual o revoca todas las sesiones abiertas en otros dispositivos.
              </p>
              {signOutAllMsg && <Alert type={signOutAllMsg.type} message={signOutAllMsg.text} onClose={() => setSignOutAllMsg(null)} className="mb-4" />}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" icon={<LogOut size={15} />} onClick={() => signOut()}>
                  Cerrar sesión actual
                </Button>
                <Button variant="danger" icon={<LogOut size={15} />} loading={signOutAllLoading} onClick={handleSignOutAll}>
                  Cerrar todas las sesiones
                </Button>
              </div>
            </div>

            {/* MFA info */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Shield size={18} className="text-slate-500" /> Autenticación multifactor (MFA)
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                La autenticación multifactor con TOTP estará disponible próximamente como función nativa de Supabase.
                Cuando se habilite, podrás añadir una capa adicional de seguridad con aplicaciones como Google Authenticator o Authy.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-lg">
                <Clock size={11} /> Próximamente
              </div>
            </div>
          </div>
        )}
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

      {/* Password change modal */}
      <Modal open={pwModalOpen} onClose={() => setPwModalOpen(false)} title="Cambiar contraseña" size="sm">
        {pwSuccess ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Contraseña actualizada</h3>
            <p className="text-sm text-slate-500">Tu contraseña se ha cambiado correctamente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pwError && <Alert type="error" message={pwError} onClose={() => setPwError('')} />}
            <Input
              label="Contraseña actual"
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              required
              icon={<KeyRound size={16} />}
              placeholder="••••••••"
            />
            <Input
              label="Nueva contraseña"
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              required
              icon={<KeyRound size={16} />}
              placeholder="Mínimo 8 caracteres"
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              required
              icon={<KeyRound size={16} />}
              placeholder="Repite la nueva contraseña"
            />
            <div className="flex gap-2 pt-2">
              <Button onClick={handlePasswordChange} loading={pwLoading}>Actualizar contraseña</Button>
              <Button variant="ghost" onClick={() => setPwModalOpen(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
