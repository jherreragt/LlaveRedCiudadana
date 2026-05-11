import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, CheckSquare, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { EnrollmentWithCourse, CertificateWithCourse } from '../../lib/types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import { attendanceBg, formatShortDate } from '../../lib/utils';
import { statusBadge } from '../../components/ui/Badge';

interface Stats {
  enrollments: number;
  certificates: number;
  avgAttendance: number;
}

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ enrollments: 0, certificates: 0, avgAttendance: 0 });
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [certificates, setCertificates] = useState<CertificateWithCourse[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    Promise.all([
      supabase.from('enrollments').select('*, courses(*)').eq('user_id', profile.id).order('enrolled_at', { ascending: false }).limit(4),
      supabase.from('certificates').select('*, courses(*)').eq('user_id', profile.id).order('issued_at', { ascending: false }).limit(3),
      supabase.from('attendance_records').select('attended').eq('user_id', profile.id),
    ]).then(([{ data: enr }, { data: certs }, { data: att }]) => {
      const attended = (att ?? []).filter((a) => a.attended).length;
      const total = (att ?? []).length;
      setRecentEnrollments((enr ?? []) as EnrollmentWithCourse[]);
      setCertificates((certs ?? []) as CertificateWithCourse[]);
      setStats({
        enrollments: enr?.length ?? 0,
        certificates: certs?.length ?? 0,
        avgAttendance: total > 0 ? Math.round((attended / total) * 100) : 0,
      });
      setLoading(false);
    });
  }, [profile, authLoading]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {profile?.full_name?.split(' ')[0] ?? 'participante'}</h1>
        <p className="text-slate-500 text-sm mt-1">Aquí tienes un resumen de tu actividad formativa.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={<BookOpen size={20} className="text-teal-600" />}
          label="Cursos inscritos"
          value={stats.enrollments}
          bg="bg-teal-50"
          onClick={() => navigate('/mis-cursos')}
        />
        <StatCard
          icon={<CheckSquare size={20} className="text-blue-600" />}
          label="Asistencia promedio"
          value={`${stats.avgAttendance}%`}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Award size={20} className="text-amber-600" />}
          label="Certificados"
          value={stats.certificates}
          bg="bg-amber-50"
          onClick={() => navigate('/mis-certificados')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent courses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><BookOpen size={16} className="text-teal-600" /> Mis cursos recientes</h2>
            <button onClick={() => navigate('/mis-cursos')} className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentEnrollments.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-400">No tienes cursos inscritos aún.</p>
                <button onClick={() => navigate('/cursos')} className="mt-2 text-sm text-teal-700 hover:underline">Explorar catálogo →</button>
              </div>
            ) : (
              recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={18} className="text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{e.courses?.title}</p>
                    <p className="text-xs text-slate-400">{formatShortDate(e.enrolled_at)}</p>
                  </div>
                  {statusBadge(e.status)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Certificates + progress */}
        <div className="space-y-5">
          {/* Certificates */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Award size={16} className="text-amber-600" /> Certificados recientes</h2>
              <button onClick={() => navigate('/mis-certificados')} className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {certificates.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">Aún no tienes certificados. Completa un curso para obtenerlo.</p>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                    <Award size={18} className="text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{cert.courses?.title}</p>
                      <p className="text-xs text-slate-500">{formatShortDate(cert.issued_at)}</p>
                    </div>
                    <span className="text-xs text-amber-700 font-medium">{cert.attendance_percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-teal-300" />
              <h3 className="font-semibold text-sm">Continúa tu formación</h3>
            </div>
            <p className="text-teal-100 text-xs mb-4 leading-relaxed">
              Explora nuevos cursos y fortalece tus capacidades para la participación ciudadana.
            </p>
            <button
              onClick={() => navigate('/cursos')}
              className="flex items-center gap-1.5 bg-white text-teal-700 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
            >
              <Calendar size={14} /> Ver catálogo de cursos
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon, label, value, bg, onClick,
}: {
  icon: React.ReactNode; label: string; value: number | string; bg: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
