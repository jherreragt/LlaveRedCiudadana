import React, { useEffect, useState } from 'react';
import { CheckSquare, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { CourseSession, Course, Profile, Enrollment, AttendanceRecord } from '../../lib/types';
import AdminLayout from '../../components/layout/AdminLayout';
import { Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { formatDateTime, downloadCSV, formatShortDate, attendanceBg } from '../../lib/utils';

interface ParticipantRow {
  profile: Profile;
  enrollment: Enrollment;
  attended: boolean;
  recordId?: string;
}

export default function AdminAttendance() {
  const { profile: adminProfile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.from('courses').select('*').order('title').then(({ data }) => setCourses(data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedCourse) { setSessions([]); setSelectedSession(''); return; }
    supabase.from('course_sessions').select('*').eq('course_id', selectedCourse).order('session_order').then(({ data }) => {
      setSessions(data ?? []);
      setSelectedSession('');
    });
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedCourse || !selectedSession) { setParticipants([]); return; }
    setLoading(true);
    (async () => {
      const [{ data: enrollments }, { data: records }] = await Promise.all([
        supabase.from('enrollments').select('*, profiles(*)').eq('course_id', selectedCourse).neq('status', 'cancelled'),
        supabase.from('attendance_records').select('*').eq('session_id', selectedSession),
      ]);

      const rows: ParticipantRow[] = (enrollments ?? []).map((e) => {
        const rec = (records ?? []).find((r) => r.user_id === e.user_id) as AttendanceRecord | undefined;
        return {
          profile: e.profiles as unknown as Profile,
          enrollment: e as Enrollment,
          attended: rec?.attended ?? false,
          recordId: rec?.id,
        };
      });
      setParticipants(rows);
      setLoading(false);
    })();
  }, [selectedCourse, selectedSession]);

  const handleToggle = async (row: ParticipantRow, attended: boolean) => {
    setSaving(row.profile.id);
    if (row.recordId) {
      await supabase.from('attendance_records').update({ attended, marked_by: adminProfile?.id, marked_at: new Date().toISOString() }).eq('id', row.recordId);
    } else {
      await supabase.from('attendance_records').insert({
        user_id: row.profile.id,
        session_id: selectedSession,
        course_id: selectedCourse,
        attended,
        marked_by: adminProfile?.id,
        marked_at: new Date().toISOString(),
      });
    }
    setParticipants((prev) => prev.map((p) => p.profile.id === row.profile.id ? { ...p, attended } : p));
    setSaving(null);
  };

  const handleExport = () => {
    const sess = sessions.find((s) => s.id === selectedSession);
    downloadCSV(
      participants.map((p) => ({
        Nombre: p.profile.full_name,
        Correo: p.profile.email,
        Organización: p.profile.organization,
        Sesión: sess?.title ?? '',
        Asistió: p.attended ? 'Sí' : 'No',
      })),
      'asistencia.csv'
    );
  };

  const presentCount = participants.filter((p) => p.attended).length;
  const pct = participants.length > 0 ? Math.round((presentCount / participants.length) * 100) : 0;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de Asistencia</h1>
          <p className="text-slate-500 text-sm mt-1">Registra la asistencia por sesión y curso</p>
        </div>
        {selectedSession && participants.length > 0 && (
          <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={handleExport}>Exportar</Button>
        )}
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      {/* Selectors */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Curso"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          options={[{ value: '', label: 'Seleccionar curso...' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]}
        />
        <Select
          label="Sesión"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          options={[
            { value: '', label: sessions.length === 0 ? 'Primero selecciona un curso' : 'Seleccionar sesión...' },
            ...sessions.map((s) => ({ value: s.id, label: `${s.session_order}. ${s.title} — ${formatDateTime(s.session_date)}` })),
          ]}
          disabled={!selectedCourse}
        />
      </div>

      {/* Summary */}
      {selectedSession && participants.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-wrap gap-6">
          <Metric label="Participantes" value={participants.length} />
          <Metric label="Presentes" value={presentCount} />
          <Metric label="Ausentes" value={participants.length - presentCount} />
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Asistencia</p>
            <span className={`text-lg font-bold px-2 py-0.5 rounded-lg ${attendanceBg(pct)}`}>{pct}%</span>
          </div>
        </div>
      )}

      {!selectedCourse || !selectedSession ? (
        <EmptyState icon={<CheckSquare size={28} />} title="Selecciona un curso y una sesión" description="Para registrar la asistencia primero elige el curso y la sesión." />
      ) : loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : participants.length === 0 ? (
        <EmptyState icon={<CheckSquare size={28} />} title="No hay participantes inscritos" description="Nadie está inscrito activamente en este curso todavía." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-medium">
                  <th className="text-left px-5 py-3">Participante</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Organización</th>
                  <th className="text-center px-4 py-3">Asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {participants.map((row) => (
                  <tr key={row.profile.id} className={`hover:bg-slate-50 transition-colors ${row.attended ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{row.profile.full_name || '—'}</p>
                      <p className="text-xs text-slate-400">{row.profile.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{row.profile.organization || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(row, !row.attended)}
                        disabled={saving === row.profile.id}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 ${row.attended ? 'bg-teal-600' : 'bg-slate-200'} ${saving === row.profile.id ? 'opacity-50' : ''}`}
                      >
                        <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 mx-0.5 ${row.attended ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
