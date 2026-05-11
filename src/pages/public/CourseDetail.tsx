import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, Calendar, CheckCircle, BookOpen, ArrowLeft, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course, CourseSession, Enrollment } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';
import { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { formatDate, formatDateTime, modalityLabel } from '../../lib/utils';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('courses').select('*').eq('id', id).maybeSingle(),
      supabase.from('course_sessions').select('*').eq('course_id', id).order('session_order'),
    ]).then(([{ data: c }, { data: s }]) => {
      setCourse(c);
      setSessions(s ?? []);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', id)
      .maybeSingle()
      .then(({ data }) => setEnrollment(data));
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) { navigate('/ingresar'); return; }
    setEnrolling(true);
    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: id!,
      status: 'active',
    });
    setEnrolling(false);
    if (error) {
      if (error.code === '23505') {
        setMessage({ type: 'error', text: 'Ya estás inscrito en este curso.' });
      } else {
        setMessage({ type: 'error', text: 'Ocurrió un error al inscribirte. Intenta de nuevo.' });
      }
    } else {
      setMessage({ type: 'success', text: '¡Te has inscrito exitosamente al curso!' });
      const { data } = await supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', id!).maybeSingle();
      setEnrollment(data);
    }
  };

  if (loading) return <PublicLayout><div className="flex justify-center py-32"><Spinner size={36} /></div></PublicLayout>;
  if (!course) return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Curso no encontrado.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/cursos')}>Ver catálogo</Button>
      </div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative bg-slate-900 h-64 overflow-hidden">
        {course.image_url && (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <button onClick={() => navigate('/cursos')} className="flex items-center gap-1.5 text-slate-300 text-sm mb-4 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Volver al catálogo
            </button>
            <div className="flex flex-wrap gap-2 mb-2">
              {course.category && <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full">{course.category}</span>}
              {statusBadge(course.modality)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{course.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {message && (
              <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Descripción del curso</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{course.description}</p>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">
                Sesiones del curso
                <span className="ml-2 text-sm font-normal text-slate-400">({sessions.length} sesiones)</span>
              </h2>
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-400">Próximamente se publicarán las sesiones.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((s, i) => (
                    <div key={s.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{s.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDateTime(s.session_date)} · {s.duration_minutes} min
                          {s.is_mandatory && <span className="ml-2 text-amber-600">· Obligatoria</span>}
                        </p>
                        {s.description && <p className="text-xs text-slate-400 mt-1">{s.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-20">
              <div className="space-y-3 mb-6 text-sm">
                <InfoRow icon={<User size={15} />} label="Instructor" value={course.instructor} />
                <InfoRow icon={<Clock size={15} />} label="Duración" value={`${course.duration_hours} horas`} />
                <InfoRow icon={<MapPin size={15} />} label="Modalidad" value={modalityLabel(course.modality)} />
                {course.location && <InfoRow icon={<MapPin size={15} />} label="Lugar" value={course.location} />}
                {course.max_participants && <InfoRow icon={<Users size={15} />} label="Cupo" value={`Máx. ${course.max_participants} participantes`} />}
                {course.start_date && <InfoRow icon={<Calendar size={15} />} label="Inicio" value={formatDate(course.start_date)} />}
                {course.end_date && <InfoRow icon={<Calendar size={15} />} label="Cierre" value={formatDate(course.end_date)} />}
              </div>

              <div className="border-t border-slate-100 pt-4 mb-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><CheckCircle size={12} className="text-teal-600" /> Asistencia mínima: {course.attendance_threshold}%</div>
                <div className="flex items-center gap-1.5 mt-1"><CheckCircle size={12} className="text-teal-600" /> Certificado al completar</div>
              </div>

              {enrollment ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
                  <p className="text-sm font-medium text-emerald-800">¡Ya estás inscrito!</p>
                  <button onClick={() => navigate('/mis-cursos')} className="text-xs text-emerald-700 hover:underline mt-1">
                    Ver en mis cursos →
                  </button>
                </div>
              ) : (
                <Button className="w-full" size="lg" onClick={handleEnroll} loading={enrolling} icon={<BookOpen size={16} />}>
                  {user ? 'Inscribirme' : 'Ingresar para inscribirme'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-slate-600">
      <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <span className="text-xs text-slate-400 block">{label}</span>
        <span className="text-sm font-medium text-slate-900">{value}</span>
      </div>
    </div>
  );
}
