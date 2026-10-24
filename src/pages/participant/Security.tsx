import { useState } from 'react';
import {
  Shield, KeyRound, Monitor, LogOut, CheckCircle, XCircle, Clock, MailCheck, Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';

export default function Security() {
  const { user, profile, emailVerified, updatePassword, signOut, signOutAll } = useAuth();
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [signOutAllLoading, setSignOutAllLoading] = useState(false);
  const [signOutAllMsg, setSignOutAllMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Seguridad</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona la seguridad de tu identidad digital.</p>
        </div>

        <div className="space-y-6">
          {/* Verification status */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MailCheck size={18} className="text-teal-600" /> Estado de verificación
            </h2>
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
            <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <KeyRound size={18} className="text-teal-600" /> Contraseña
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Cambia tu contraseña periódicamente para mayor seguridad. Necesitarás tu contraseña actual.
            </p>
            <Button variant="outline" icon={<KeyRound size={15} />} onClick={() => { setPwForm({ current: '', next: '', confirm: '' }); setPwError(''); setPwSuccess(false); setPwModalOpen(true); }}>
              Cambiar contraseña
            </Button>
          </div>

          {/* Sessions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Monitor size={18} className="text-teal-600" /> Sesiones
            </h2>
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
            <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Shield size={18} className="text-slate-500" /> Autenticación multifactor (MFA)
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              La autenticación multifactor con TOTP estará disponible próximamente como función nativa
              de la plataforma. Cuando se habilite, podrás añadir una capa adicional de seguridad con
              aplicaciones como Google Authenticator o Authy.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-lg">
              <Clock size={11} /> Próximamente
            </div>
          </div>
        </div>
      </div>

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
