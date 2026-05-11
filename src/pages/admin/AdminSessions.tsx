import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { CourseSession, Course } from '../../lib/types';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { formatDateTime } from '../../lib/utils';

interface SessionWithCourse extends CourseSession { courses?: Course }

type SForm = { course_id: string; title: string; session_date: string; duration_minutes: number; description: string; location: string; is_mandatory: boolean; session_order: number };
const empty: SForm = { course_id: '', title: '', session_date: '', duration_minutes: 90, description: '', location: '', is_mandatory: true, session_order: 1 };

export default function AdminSessions() {
  const [sessions, setSessions] = useState<SessionWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CourseSession | null>(null);
  const [form, setForm] = useState<SForm>(empty);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    const [{ data: s }, { data: c }] = await Promise.all([
      supabase.from('course_sessions').select('*, courses(*)').order('session_date', { ascending: false }),
      supabase.from('courses').select('*').order('title'),
    ]);
    setSessions((s ?? []) as SessionWithCourse[]);
    setCourses(c ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (field: keyof SForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = ['duration_minutes', 'session_order'].includes(field) ? parseInt(e.target.value) || 0 : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const openNew = () => { setEditing(null); setForm({ ...empty, course_id: courseFilter }); setModalOpen(true); };
  const openEdit = (s: CourseSession) => {
    setEditing(s);
    const dt = new Date(s.session_date);
    const localStr = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ course_id: s.course_id, title: s.title, session_date: localStr, duration_minutes: s.duration_minutes, description: s.description, location: s.location, is_mandatory: s.is_mandatory, session_order: s.session_order });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.course_id || !form.session_date) { setAlert({ type: 'error', text: 'Completa los campos obligatorios.' }); return; }
    setSaving(true);
    const payload = { ...form, is_mandatory: form.is_mandatory };
    if (editing) {
      const { error } = await supabase.from('course_sessions').update(payload).eq('id', editing.id);
      if (error) { setAlert({ type: 'error', text: 'Error al actualizar.' }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('course_sessions').insert(payload);
      if (error) { setAlert({ type: 'error', text: 'Error al crear la sesión.' }); setSaving(false); return; }
    }
    setSaving(false);
    setAlert({ type: 'success', text: editing ? 'Sesión actualizada.' : 'Sesión creada.' });
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta sesión?')) return;
    const { error } = await supabase.from('course_sessions').delete().eq('id', id);
    if (error) { setAlert({ type: 'error', text: 'Error al eliminar.' }); } else { load(); }
  };

  const filtered = sessions.filter((s) => !courseFilter || s.course_id === courseFilter);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sesiones de Cursos</h1>
          <p className="text-slate-500 text-sm mt-1">{sessions.length} sesión{sessions.length !== 1 ? 'es' : ''} en total</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openNew}>Nueva sesión</Button>
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <Select
          label=""
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          options={[{ value: '', label: 'Todos los cursos' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Calendar size={28} />} title="No hay sesiones" action={<Button onClick={openNew} icon={<Plus size={15} />}>Crear sesión</Button>} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-medium">
                  <th className="text-left px-5 py-3">Sesión</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Curso</th>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Duración</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{s.title}</p>
                      <p className="text-xs text-slate-400">Sesión #{s.session_order} {s.is_mandatory ? '· Obligatoria' : '· Optativa'}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600 max-w-[200px] truncate">{(s as SessionWithCourse).courses?.title}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(s.session_date)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{s.duration_minutes} min</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(s)} className="text-xs text-teal-700 hover:underline font-medium flex items-center gap-1"><Edit2 size={12} /> Editar</button>
                        <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline font-medium flex items-center gap-1"><Trash2 size={12} /> Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar sesión' : 'Nueva sesión'} size="md">
        <div className="space-y-4">
          <Select label="Curso *" value={form.course_id} onChange={set('course_id')} required options={[{ value: '', label: 'Seleccionar curso...' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]} />
          <Input label="Título de la sesión *" value={form.title} onChange={set('title')} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Fecha y hora *" type="datetime-local" value={form.session_date} onChange={set('session_date')} required />
            <Input label="Duración (min)" type="number" value={form.duration_minutes} onChange={set('duration_minutes')} />
            <Input label="Orden" type="number" value={form.session_order} onChange={set('session_order')} />
            <Input label="Lugar" value={form.location} onChange={set('location')} />
          </div>
          <Textarea label="Descripción" value={form.description} onChange={set('description')} rows={2} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="mandatory" checked={form.is_mandatory} onChange={(e) => setForm((f) => ({ ...f, is_mandatory: e.target.checked }))} className="rounded" />
            <label htmlFor="mandatory" className="text-sm text-slate-700">Sesión obligatoria</label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Actualizar' : 'Crear sesión'}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
