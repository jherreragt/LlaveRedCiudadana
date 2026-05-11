import React, { useEffect, useState } from 'react';
import { Plus, Search, BookOpen, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Course } from '../../lib/types';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { statusBadge } from '../../components/ui/Badge';
import { formatShortDate, modalityLabel } from '../../lib/utils';

type CourseForm = Omit<Course, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

const empty: CourseForm = {
  title: '', description: '', instructor: '', duration_hours: 0,
  start_date: null, end_date: null, status: 'draft', max_participants: 30,
  attendance_threshold: 75, image_url: '', category: '', location: '',
  modality: 'virtual',
};

export default function AdminCourses() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(empty);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description, instructor: c.instructor, duration_hours: c.duration_hours, start_date: c.start_date, end_date: c.end_date, status: c.status, max_participants: c.max_participants, attendance_threshold: c.attendance_threshold, image_url: c.image_url, category: c.category, location: c.location, modality: c.modality });
    setModalOpen(true);
  };

  const set = (field: keyof CourseForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = ['duration_hours', 'max_participants', 'attendance_threshold'].includes(field)
      ? parseInt(e.target.value) || 0
      : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setAlert({ type: 'error', text: 'El título es obligatorio.' }); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('courses').update(form).eq('id', editing.id);
      setSaving(false);
      if (error) { setAlert({ type: 'error', text: 'Error al actualizar el curso.' }); return; }
    } else {
      const { error } = await supabase.from('courses').insert({ ...form, created_by: profile?.id });
      setSaving(false);
      if (error) { setAlert({ type: 'error', text: 'Error al crear el curso.' }); return; }
    }
    setAlert({ type: 'success', text: editing ? 'Curso actualizado.' : 'Curso creado exitosamente.' });
    setModalOpen(false);
    load();
  };

  const filtered = courses.filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Cursos</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} curso{courses.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openNew}>Nuevo curso</Button>
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <Input placeholder="Buscar cursos..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={15} />} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BookOpen size={28} />} title="No hay cursos" action={<Button onClick={openNew} icon={<Plus size={15} />}>Crear primer curso</Button>} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-medium">
                  <th className="text-left px-5 py-3">Curso</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Modalidad</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Inicio</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Horas</th>
                  <th className="text-right px-5 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.instructor}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{modalityLabel(c.modality)}</td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{formatShortDate(c.start_date)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{c.duration_hours}h</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(c)} className="text-xs text-teal-700 hover:underline font-medium flex items-center gap-1 ml-auto">
                        <Edit2 size={12} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar curso' : 'Nuevo curso'} size="lg">
        <div className="space-y-4">
          <Input label="Título del curso" value={form.title} onChange={set('title')} required />
          <Textarea label="Descripción" value={form.description} onChange={set('description')} rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Instructor" value={form.instructor} onChange={set('instructor')} />
            <Input label="Categoría" value={form.category} onChange={set('category')} />
            <Input label="Duración (horas)" type="number" value={form.duration_hours} onChange={set('duration_hours')} />
            <Input label="Cupo máximo" type="number" value={form.max_participants} onChange={set('max_participants')} />
            <Input label="Umbral asistencia (%)" type="number" value={form.attendance_threshold} onChange={set('attendance_threshold')} />
            <Select label="Modalidad" value={form.modality} onChange={set('modality')} options={[
              { value: 'virtual', label: 'Virtual' },
              { value: 'presencial', label: 'Presencial' },
              { value: 'hibrido', label: 'Híbrido' },
            ]} />
            <Select label="Estado" value={form.status} onChange={set('status')} options={[
              { value: 'draft', label: 'Borrador' },
              { value: 'active', label: 'Activo' },
              { value: 'completed', label: 'Finalizado' },
            ]} />
            <Input label="Lugar / Plataforma" value={form.location} onChange={set('location')} />
            <Input label="Fecha de inicio" type="date" value={form.start_date ?? ''} onChange={set('start_date')} />
            <Input label="Fecha de cierre" type="date" value={form.end_date ?? ''} onChange={set('end_date')} />
          </div>
          <Input label="URL de imagen" value={form.image_url} onChange={set('image_url')} placeholder="https://images.pexels.com/..." />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Actualizar' : 'Crear curso'}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
