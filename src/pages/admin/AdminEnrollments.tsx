import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Enrollment, Profile, Course } from '../../lib/types';
import AdminLayout from '../../components/layout/AdminLayout';
import Input from '../../components/ui/Input';
import { Select } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { statusBadge } from '../../components/ui/Badge';
import { formatShortDate, downloadCSV } from '../../lib/utils';

interface EnrollmentRow extends Enrollment { profiles?: Profile; courses?: Course }

export default function AdminEnrollments() {
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    const [{ data: enr }, { data: c }] = await Promise.all([
      supabase.from('enrollments').select('*, profiles(*), courses(*)').order('enrolled_at', { ascending: false }),
      supabase.from('courses').select('id, title').order('title'),
    ]);
    setRows((enr ?? []) as EnrollmentRow[]);
    setCourses(c ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: Enrollment['status']) => {
    const { error } = await supabase.from('enrollments').update({ status }).eq('id', id);
    if (error) { setAlert({ type: 'error', text: 'Error al actualizar el estado.' }); } else { load(); }
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.profiles?.full_name?.toLowerCase().includes(q) || r.profiles?.email?.toLowerCase().includes(q) || r.courses?.title?.toLowerCase().includes(q);
    const matchCourse = !courseFilter || r.course_id === courseFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  const handleExport = () => {
    downloadCSV(
      filtered.map((r) => ({
        Nombre: r.profiles?.full_name ?? '',
        Correo: r.profiles?.email ?? '',
        Organización: r.profiles?.organization ?? '',
        Curso: r.courses?.title ?? '',
        Estado: r.status,
        Inscripción: formatShortDate(r.enrolled_at),
      })),
      'inscripciones.csv'
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inscripciones</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} inscripción{rows.length !== 1 ? 'es' : ''} en total</p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={handleExport}>
          Exportar CSV
        </Button>
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar por nombre, correo o curso..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={15} />} />
        </div>
        <Select label="" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} options={[{ value: '', label: 'Todos los cursos' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]} className="min-w-[200px]" />
        <Select label="" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[
          { value: '', label: 'Todos los estados' },
          { value: 'active', label: 'Activo' },
          { value: 'completed', label: 'Completado' },
          { value: 'cancelled', label: 'Cancelado' },
        ]} className="min-w-[160px]" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList size={28} />} title="No se encontraron inscripciones" description="Intenta con otros filtros." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-medium">
                  <th className="text-left px-5 py-3">Participante</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Curso</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Fecha</th>
                  <th className="text-right px-5 py-3">Cambiar estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{r.profiles?.full_name || '—'}</p>
                      <p className="text-xs text-slate-400">{r.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 max-w-[200px] truncate">{r.courses?.title}</td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{formatShortDate(r.enrolled_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value as Enrollment['status'])}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="active">Activo</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
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
