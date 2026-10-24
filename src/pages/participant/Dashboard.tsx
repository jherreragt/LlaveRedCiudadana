import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Building2, Globe, MapPin, Phone, Briefcase, ArrowRight, Shield, CheckCircle, MailCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { formatDate, getInitials } from '../../lib/utils';
import { statusBadge } from '../../components/ui/Badge';

interface ProfileField {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  key: string;
}

export default function Dashboard() {
  const { profile, emailVerified, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) setLoading(false);
  }, [authLoading]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const fields: ProfileField[] = [
    { icon: <Mail size={16} />, label: 'Correo', value: profile?.email ?? '', key: 'email' },
    { icon: <Phone size={16} />, label: 'Teléfono', value: profile?.phone ?? '', key: 'phone' },
    { icon: <Building2 size={16} />, label: 'Organización', value: profile?.organization ?? '', key: 'organization' },
    { icon: <Briefcase size={16} />, label: 'Cargo', value: profile?.job_title ?? '', key: 'job_title' },
    { icon: <Globe size={16} />, label: 'País', value: profile?.country ?? '', key: 'country' },
    { icon: <MapPin size={16} />, label: 'Ciudad', value: profile?.city ?? '', key: 'city' },
  ];

  const filledCount = fields.filter((f) => f.value && f.value.trim() !== '').length;
  const completionPct = Math.round((filledCount / fields.length) * 100);

  const incompleteFields = fields.filter((f) => !f.value || f.value.trim() === '');

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {profile?.full_name?.split(' ')[0] ?? 'ciudadano'}</h1>
        <p className="text-slate-500 text-sm mt-1">Este es tu portal de identidad ciudadana.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-teal-700 to-teal-800 p-6 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 backdrop-blur">
                {getInitials(profile?.full_name ?? 'U')}
              </div>
              <h2 className="text-white font-bold text-lg">{profile?.full_name || '—'}</h2>
              <p className="text-teal-100 text-sm mt-0.5">{profile?.email}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {statusBadge(profile?.role ?? 'participant')}
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-teal-100">
                    <MailCheck size={12} /> Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-200">
                    <AlertTriangle size={12} /> Sin verificar
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Miembro desde</span>
                <span className="font-medium text-slate-900">{formatDate(profile?.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Estado</span>
                <span className={`flex items-center gap-1 font-medium ${profile?.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                  {profile?.is_active ? <><CheckCircle size={14} /> Activo</> : 'Inactivo'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                icon={<User size={15} />}
                onClick={() => navigate('/perfil')}
              >
                Editar mi perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Profile info + completion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Completion progress */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Shield size={18} className="text-teal-600" />
                Completitud del perfil
              </h2>
              <span className={`text-2xl font-bold ${completionPct >= 80 ? 'text-emerald-600' : completionPct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {completionPct}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${completionPct >= 80 ? 'bg-emerald-500' : completionPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            {incompleteFields.length > 0 ? (
              <div>
                <p className="text-sm text-slate-500 mb-3">Completa estos campos para fortalecer tu identidad digital:</p>
                <div className="flex flex-wrap gap-2">
                  {incompleteFields.map((f) => (
                    <span key={f.key} className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg">
                      {f.icon}
                      {f.label}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-4"
                  icon={<ArrowRight size={15} />}
                  onClick={() => navigate('/perfil')}
                >
                  Completar perfil
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle size={18} />
                <span className="font-medium">Tu perfil está completo</span>
              </div>
            )}
          </div>

          {/* Profile details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Información de identidad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 mt-0.5 shrink-0">{f.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">{f.label}</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{f.value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
