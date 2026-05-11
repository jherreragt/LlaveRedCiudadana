import React, { useEffect, useState } from 'react';
import { Award, Plus, Download, Search, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Certificate, Course, Profile, Enrollment } from '../../lib/types';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { formatShortDate, downloadCSV } from '../../lib/utils';

interface CertRow extends Certificate { profiles?: Profile; courses?: Course }
interface EligibleRow {
  profile: Profile;
  enrollment: Enrollment;
  attendancePct: number;
  threshold: number;
  hasCertificate: boolean;
}

export default function AdminCertificates() {
  const { profile: adminProfile } = useAuth();
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [issueModal, setIssueModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [eligible, setEligible] = useState<EligibleRow[]>([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [issuing, setIssuing] = useState<string | null>(null);

  const load = async () => {
    const [{ data: c }, { data: courses }] = await Promise.all([
      supabase.from('certificates').select('*, profiles(*), courses(*)').order('issued_at', { ascending: false }),
      supabase.from('courses').select('*').order('title'),
    ]);
    setCerts((c ?? []) as CertRow[]);
    setCourses(courses ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadEligible = async (courseId: string) => {
    if (!courseId) return;
    setLoadingEligible(true);
    const course = courses.find((c) => c.id === courseId);
    const threshold = course?.attendance_threshold ?? 75;

    const [{ data: enrollments }, { data: existingCerts }, { data: sessions }] = await Promise.all([
      supabase.from('enrollments').select('*, profiles(*)').eq('course_id', courseId).neq('status', 'cancelled'),
      supabase.from('certificates').select('user_id').eq('course_id', courseId),
      supabase.from('course_sessions').select('id').eq('course_id', courseId),
    ]);

    const totalSessions = sessions?.length ?? 0;
    const certUserIds = new Set((existingCerts ?? []).map((c) => c.user_id));

    const rows: EligibleRow[] = await Promise.all(
      (enrollments ?? []).map(async (e) => {
        const { count } = await supabase
          .from('attendance_records')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', e.user_id)
          .eq('course_id', courseId)
          .eq('attended', true);
        const pct = totalSessions > 0 ? Math.round(((count ?? 0) / totalSessions) * 100) : 0;
        return {
          profile: e.profiles as unknown as Profile,
          enrollment: e as Enrollment,
          attendancePct: pct,
          threshold,
          hasCertificate: certUserIds.has(e.user_id),
        };
      })
    );
    setEligible(rows.sort((a, b) => b.attendancePct - a.attendancePct));
    setLoadingEligible(false);
  };

  const handleIssueCertificate = async (row: EligibleRow) => {
    setIssuing(row.profile.id);
    const { error } = await supabase.from('certificates').insert({
      user_id: row.profile.id,
      course_id: selectedCourse,
      issued_by: adminProfile?.id,
      attendance_percentage: row.attendancePct,
      is_valid: true,
    });
    setIssuing(null);
    if (error) {
      setAlert({ type: 'error', text: 'Error al emitir el certificado.' });
    } else {
      setAlert({ type: 'success', text: `Certificado emitido para ${row.profile.full_name}.` });
      setEligible((prev) => prev.map((p) => p.profile.id === row.profile.id ? { ...p, hasCertificate: true } : p));
      load();
    }
  };

  const handleInvalidate = async (id: string) => {
    if (!confirm('¿Anular este certificado?')) return;
    await supabase.from('certificates').update({ is_valid: false }).eq('id', id);
    load();
  };

  const filtered = certs.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.profiles?.full_name?.toLowerCase().includes(q) || c.profiles?.email?.toLowerCase().includes(q) || c.courses?.title?.toLowerCase().includes(q);
    const matchCourse = !courseFilter || c.course_id === courseFilter;
    return matchSearch && matchCourse;
  });

  const handleExport = () => {
    downloadCSV(
      filtered.map((c) => ({
        Nombre: c.profiles?.full_name ?? '',
        Correo: c.profiles?.email ?? '',
        Curso: c.courses?.title ?? '',
        Código: c.certificate_code,
        Asistencia: `${c.attendance_percentage}%`,
        'Fecha emisión': formatShortDate(c.issued_at),
        Válido: c.is_valid ? 'Sí' : 'No',
      })),
      'certificados.csv'
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Certificados</h1>
          <p className="text-slate-500 text-sm mt-1">{certs.length} certificado{certs.length !== 1 ? 's' : ''} emitido{certs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={handleExport}>Exportar</Button>
          <Button icon={<Plus size={16} />} onClick={() => { setIssueModal(true); setSelectedCourse(''); setEligible([]); }}>Emitir certificados</Button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar por nombre, correo o curso..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={15} />} />
        </div>
        <Select label="" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} options={[{ value: '', label: 'Todos los cursos' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]} className="min-w-[200px]" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Award size={28} />} title="No hay certificados" description="Emite certificados para los participantes que cumplan con la asistencia." action={<Button onClick={() => setIssueModal(true)} icon={<Plus size={15} />}>Emitir certificados</Button>} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-medium">
                  <th className="text-left px-5 py-3">Participante</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Curso</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Asistencia</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{c.profiles?.full_name || '—'}</p>
                      <p className="text-xs text-slate-400">{c.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 max-w-[180px] truncate">{c.courses?.title}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm font-medium text-slate-900">{c.attendance_percentage}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{formatShortDate(c.issued_at)}</td>
                    <td className="px-4 py-3">
                      {c.is_valid ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle size={12} /> Válido</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><XCircle size={12} /> Anulado</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {c.is_valid && (
                        <button onClick={() => handleInvalidate(c.id)} className="text-xs text-red-500 hover:underline font-medium">Anular</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={issueModal} onClose={() => setIssueModal(false)} title="Emitir certificados" size="lg">
        <div className="space-y-4">
          <Select
            label="Seleccionar curso"
            value={selectedCourse}
            onChange={(e) => { setSelectedCourse(e.target.value); loadEligible(e.target.value); }}
            options={[{ value: '', label: 'Seleccionar...' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]}
          />
          {loadingEligible && <div className="flex justify-center py-8"><Spinner size={30} /></div>}
          {!loadingEligible && eligible.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {eligible.map((row) => (
                <div key={row.profile.id} className={`flex items-center justify-between p-3 rounded-xl border ${row.hasCertificate ? 'bg-slate-50 border-slate-100' : row.attendancePct >= row.threshold ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.profile.full_name}</p>
                    <p className="text-xs text-slate-500">Asistencia: <strong>{row.attendancePct}%</strong> · Umbral: {row.threshold}%</p>
                  </div>
                  {row.hasCertificate ? (
                    <span className="text-xs text-slate-500 flex items-center gap-1"><CheckCircle size={12} /> Emitido</span>
                  ) : row.attendancePct >= row.threshold ? (
                    <Button size="sm" loading={issuing === row.profile.id} onClick={() => handleIssueCertificate(row)}>
                      Emitir
                    </Button>
                  ) : (
                    <span className="text-xs text-red-500">No elegible</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {!loadingEligible && selectedCourse && eligible.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay participantes inscritos en este curso.</p>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}
