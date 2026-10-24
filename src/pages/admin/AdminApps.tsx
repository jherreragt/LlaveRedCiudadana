import { useEffect, useState } from 'react';
import { Plug, Plus, Trash2, Edit2, Power } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/layout/AdminLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/Input';
import type { ConnectedApp } from '../../lib/types';
import { formatShortDate } from '../../lib/utils';

export default function AdminApps() {
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConnectedApp | null>(null);
  const [form, setForm] = useState({ name: '', description: '', client_id: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('connected_apps').select('*').order('created_at', { ascending: false });
    setApps((data ?? []) as ConnectedApp[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', client_id: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (app: ConnectedApp) => {
    setEditing(app);
    setForm({ name: app.name, description: app.description, client_id: app.client_id, status: app.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from('connected_apps')
        .update({ name: form.name, description: form.description, status: form.status })
        .eq('id', editing.id);
      if (error) {
        setAlert({ type: 'error', text: 'No se pudo actualizar la aplicación.' });
      } else {
        setAlert({ type: 'success', text: 'Aplicación actualizada correctamente.' });
        setModalOpen(false);
        load();
      }
    } else {
      const { error } = await supabase.from('connected_apps').insert({
        name: form.name,
        description: form.description,
        client_id: form.client_id,
        status: form.status,
      });
      if (error) {
        setAlert({ type: 'error', text: error.message.includes('duplicate') ? 'Ya existe una app con ese client_id.' : 'No se pudo crear la aplicación.' });
      } else {
        setAlert({ type: 'success', text: 'Aplicación creada correctamente.' });
        setModalOpen(false);
        load();
      }
    }
    setSaving(false);
  };

  const handleToggle = async (app: ConnectedApp) => {
    const newStatus = app.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('connected_apps').update({ status: newStatus }).eq('id', app.id);
    if (error) {
      setAlert({ type: 'error', text: 'No se pudo cambiar el estado.' });
    } else {
      load();
    }
  };

  const handleDelete = async (app: ConnectedApp) => {
    if (!confirm(`¿Eliminar la aplicación "${app.name}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('connected_apps').delete().eq('id', app.id);
    if (error) {
      setAlert({ type: 'error', text: 'No se pudo eliminar la aplicación.' });
    } else {
      setAlert({ type: 'success', text: 'Aplicación eliminada.' });
      load();
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Aplicaciones autorizadas</h1>
          <p className="text-slate-500 text-sm mt-1">{apps.length} aplicación{apps.length !== 1 ? 'es' : ''} registrada{apps.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nueva aplicación</Button>
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      {apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={<Plug size={28} />}
            title="Sin aplicaciones registradas"
            description="Registra aplicaciones que pueden integrarse con Llave GT."
            action={<Button size="sm" icon={<Plus size={14} />} onClick={openCreate}>Crear aplicación</Button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                <Plug size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900">{app.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {app.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{app.description || 'Sin descripción'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Client ID: <span className="font-mono">{app.client_id}</span> · Creada {formatShortDate(app.created_at)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(app)} className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" aria-label={app.status === 'active' ? 'Desactivar' : 'Activar'}>
                  <Power size={16} />
                </button>
                <button onClick={() => openEdit(app)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" aria-label="Editar">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(app)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Eliminar">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar aplicación' : 'Nueva aplicación'} size="md">
        <div className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nombre de la aplicación" />
          <Input label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve" />
          <Input
            label="Client ID"
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            required
            disabled={!!editing}
            placeholder="identificador-unico"
            hint={editing ? 'No se puede modificar después de crear' : 'Identificador único para la aplicación'}
          />
          <Select
            label="Estado"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { value: 'active', label: 'Activa' },
              { value: 'inactive', label: 'Inactiva' },
            ]}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} loading={saving}>{editing ? 'Guardar cambios' : 'Crear aplicación'}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
