import { useEffect, useState } from 'react';
import { Search, Users, Edit2, UserCheck, UserX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../lib/types';
import AdminLayout from '../../components/layout/AdminLayout';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { statusBadge } from '../../components/ui/Badge';
import { formatShortDate, getInitials } from '../../lib/utils';

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.organization.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);

    // Use SECURITY DEFINER RPCs instead of direct table UPDATE —
    // the role and is_active columns are not writable via the Data API.
    const { error: roleError } = await supabase.rpc('set_user_role', {
      p_user_id: editUser.id,
      p_role: editUser.role,
      p_scope: editUser.admin_scope ?? null,
    });

    if (roleError) {
      setSaving(false);
      const msg = roleError.message ?? '';
      if (msg.includes('own role')) {
        setAlert({ type: 'error', text: 'No puedes cambiar tu propio rol. Pide a otro administrador que lo haga.' });
      } else if (msg.includes('Permission denied')) {
        setAlert({ type: 'error', text: 'No tienes permisos para cambiar roles.' });
      } else {
        setAlert({ type: 'error', text: 'Error al actualizar el rol del usuario.' });
      }
      return;
    }

    const { error: activeError } = await supabase.rpc('set_user_active', {
      p_user_id: editUser.id,
      p_active: editUser.is_active,
    });

    setSaving(false);
    if (activeError) {
      const msg = activeError.message ?? '';
      if (msg.includes('own active')) {
        setAlert({ type: 'error', text: 'No puedes cambiar tu propio estado. Pide a otro administrador.' });
      } else {
        setAlert({ type: 'error', text: 'Error al actualizar el estado del usuario.' });
      }
      return;
    }

    setAlert({ type: 'success', text: 'Usuario actualizado correctamente.' });
    setEditUser(null);
    load();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.text} onClose={() => setAlert(null)} className="mb-4" />}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Buscar por nombre, correo u organización..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={15} />} />
        </div>
        <Select
          options={[
            { value: '', label: 'Todos los roles' },
            { value: 'participant', label: 'Participante' },
            { value: 'coordinator', label: 'Coordinador' },
            { value: 'admin', label: 'Administrador' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-auto min-w-[180px]"
          label=""
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No se encontraron usuarios" description="Intenta con otros filtros." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Participante</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Organización</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Registro</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(u.full_name || u.email)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.full_name || '—'}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell">{u.organization || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(u.role)}</td>
                    <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{formatShortDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600"><UserCheck size={12} /> Activo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500"><UserX size={12} /> Inactivo</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setEditUser(u)}
                        className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline font-medium"
                      >
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

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Editar usuario">
        {editUser && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900">{editUser.full_name}</p>
              <p className="text-xs text-slate-500">{editUser.email}</p>
            </div>
            <Select
              label="Rol"
              value={editUser.role}
              onChange={(e) => setEditUser({ ...editUser, role: e.target.value as Profile['role'] })}
              options={[
                { value: 'participant', label: 'Participante' },
                { value: 'coordinator', label: 'Coordinador' },
                { value: 'admin', label: 'Administrador' },
              ]}
            />
            {editUser.role === 'admin' && (
              <Select
                label="Alcance del admin"
                value={editUser.admin_scope ?? ''}
                onChange={(e) => setEditUser({ ...editUser, admin_scope: (e.target.value || null) as Profile['admin_scope'] })}
                options={[
                  { value: '', label: 'Ambos (Llave GT + Escuela)' },
                  { value: 'llave_gt', label: 'Solo Llave GT' },
                  { value: 'escuela', label: 'Solo Escuela' },
                ]}
              />
            )}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={editUser.is_active}
                onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm text-slate-700">Cuenta activa</label>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} loading={saving}>Guardar cambios</Button>
              <Button variant="ghost" onClick={() => setEditUser(null)}>Cancelar</Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
