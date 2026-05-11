import React, { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, CheckSquare, Award, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';

interface DashStats {
  users: number;
  activeCourses: number;
  enrollments: number;
  attendanceAvg: number;
  certificates: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashStats>({
    users: 0, activeCourses: 0, enrollments: 0, attendanceAvg: 0, certificates: 0,
  });

  useEffect(() => {
    (async () => {
      const [
        { count: users },
        { count: activeCourses },
        { count: enrollments },
        { data: attendance },
        { count: certificates },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('attendance_records').select('attended'),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('is_valid', true),
      ]);

      const total = (attendance ?? []).length;
      const attended = (attendance ?? []).filter((a) => a.attended).length;

      setStats({
        users: users ?? 0,
        activeCourses: activeCourses ?? 0,
        enrollments: enrollments ?? 0,
        attendanceAvg: total > 0 ? Math.round((attended / total) * 100) : 0,
        certificates: certificates ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen del sistema LlaveRed Ciudadana</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
        <AdminStat icon={<Users size={20} />} label="Usuarios registrados" value={stats.users} color="teal" />
        <AdminStat icon={<BookOpen size={20} />} label="Cursos activos" value={stats.activeCourses} color="blue" />
        <AdminStat icon={<ClipboardList size={20} />} label="Inscripciones" value={stats.enrollments} color="amber" />
        <AdminStat icon={<CheckSquare size={20} />} label="Asistencia promedio" value={`${stats.attendanceAvg}%`} color="emerald" />
        <AdminStat icon={<Award size={20} />} label="Certificados emitidos" value={stats.certificates} color="orange" />
      </div>

      {/* Quick overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-teal-600" /> Actividad del sistema
          </h2>
          <p className="text-sm text-slate-500 mb-5">Métricas clave de la plataforma</p>
          <div className="space-y-4">
            <MetricRow label="Tasa de asistencia global" value={stats.attendanceAvg} max={100} color="teal" />
            <MetricRow
              label="Cursos con participantes"
              value={stats.enrollments > 0 ? Math.min(stats.activeCourses, stats.enrollments) : 0}
              max={Math.max(stats.activeCourses, 1)}
              color="blue"
              format={(v) => `${v} cursos`}
            />
            <MetricRow
              label="Participantes certificados"
              value={stats.certificates}
              max={Math.max(stats.enrollments, 1)}
              color="amber"
              format={(v) => `${v} personas`}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <Activity size={18} className="text-blue-600" /> Acciones rápidas
          </h2>
          <p className="text-sm text-slate-500 mb-5">Gestiona el contenido desde aquí</p>
          <div className="space-y-3">
            {[
              { label: 'Gestionar usuarios', href: '/admin/usuarios', color: 'teal' },
              { label: 'Administrar cursos', href: '/admin/cursos', color: 'blue' },
              { label: 'Registrar asistencia', href: '/admin/asistencia', color: 'amber' },
              { label: 'Emitir certificados', href: '/admin/certificados', color: 'emerald' },
              { label: 'Ver inscripciones', href: '/admin/inscripciones', color: 'slate' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">{item.label}</span>
                <span className="text-slate-300 group-hover:text-teal-600">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 text-teal-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className={`w-10 h-10 ${colorMap[color]} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function MetricRow({
  label, value, max, color, format,
}: {
  label: string; value: number; max: number; color: string; format?: (v: number) => string;
}) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500', blue: 'bg-blue-500', amber: 'bg-amber-500',
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-900">{format ? format(value) : `${pct}%`}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorMap[color]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
