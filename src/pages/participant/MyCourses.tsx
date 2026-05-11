import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckSquare, ArrowRight, BarChart2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { EnrollmentWithCourse } from '../../lib/types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { statusBadge } from '../../components/ui/Badge';
import { formatShortDate, attendanceBg } from '../../lib/utils';

interface EnrollmentWithAttendance extends EnrollmentWithCourse {
  attendancePct: number;
  totalSessions: number;
  attendedSessions: number;
}

export default function MyCourses() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentWithAttendance[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    (async () => {
      const { data: enr } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', profile.id)
        .order('enrolled_at', { ascending: false });

      if (!enr) { setLoading(false); return; }

      const enriched = await Promise.all(
        enr.map(async (e) => {
          const [{ count: total }, { count: attended }] = await Promise.all([
            supabase.from('course_sessions').select('*', { count: 'exact', head: true }).eq('course_id', e.course_id),
            supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('course_id', e.course_id).eq('attended', true),
          ]);
          const totalSessions = total ?? 0;
          const attendedSessions = attended ?? 0;
          return {
            ...e,
            courses: e.courses as EnrollmentWithCourse['courses'],
            attendancePct: totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0,
            totalSessions,
            attendedSessions,
          } as EnrollmentWithAttendance;
        })
      );
      setEnrollments(enriched);
      setLoading(false);
    })();
  }, [profile, authLoading]);

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Cursos</h1>
          <p className="text-slate-500 text-sm mt-1">{enrollments.length} inscripción{enrollments.length !== 1 ? 'es' : ''}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/cursos')} icon={<ArrowRight size={16} />}>
          Explorar cursos
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No tienes cursos inscritos"
          description="Explora el catálogo y encuentra el curso que mejor se adapte a tus intereses."
          action={<Button onClick={() => navigate('/cursos')}>Ver catálogo</Button>}
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{e.courses?.title}</h3>
                    {statusBadge(e.status)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {e.courses?.instructor && <span>{e.courses.instructor}</span>}
                    <span className="flex items-center gap-1"><Clock size={11} />{e.courses?.duration_hours}h</span>
                    <span>Inscrito: {formatShortDate(e.enrolled_at)}</span>
                  </div>
                </div>

                {/* Attendance */}
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto sm:mx-0">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={e.attendancePct >= 75 ? '#0d9488' : e.attendancePct >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="3"
                        strokeDasharray={`${e.attendancePct} ${100 - e.attendancePct}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-slate-700">{e.attendancePct}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{e.attendedSessions}/{e.totalSessions} ses.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => navigate(`/cursos/${e.course_id}`)}
                    className="text-xs text-teal-700 font-medium hover:underline flex items-center gap-1"
                  >
                    Ver curso <ArrowRight size={11} />
                  </button>
                  {e.attendancePct >= (e.courses?.attendance_threshold ?? 75) && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckSquare size={11} /> Elegible para certificado
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1"><BarChart2 size={11} /> Asistencia</span>
                  <span>Umbral: {e.courses?.attendance_threshold ?? 75}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${e.attendancePct >= 75 ? 'bg-teal-500' : e.attendancePct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    style={{ width: `${e.attendancePct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
