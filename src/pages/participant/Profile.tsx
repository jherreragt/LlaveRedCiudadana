import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Building2, Briefcase, Globe, MapPin, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { getInitials, formatDate } from '../../lib/utils';
import { statusBadge } from '../../components/ui/Badge';

export default function Profile() {
  const { profile, loading: authLoading, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    organization: '',
    job_title: '',
    country: '',
    city: '',
  });

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
      .update({ ...form, updated_at: new Date().toISOString() })
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

  if (authLoading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500 text-sm mt-1">Actualiza tu información institucional.</p>
        </div>

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
            {getInitials(profile?.full_name ?? 'U')}
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">{profile?.full_name || '—'}</h2>
            <p className="text-slate-500 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {statusBadge(profile?.role ?? 'participant')}
              <span className="text-xs text-slate-400">Desde {formatDate(profile?.created_at)}</span>
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
              <Input label="Correo electrónico" value={profile?.email ?? ''} disabled icon={<Mail size={16} />} hint="El correo no puede modificarse." />
              <Input label="Teléfono" value={form.phone} onChange={set('phone')} icon={<Phone size={16} />} placeholder="+52 55 0000 0000" />
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
    </DashboardLayout>
  );
}
