import { useState } from 'react';
import { useList } from '../hooks/useList';
import { usuariosApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import { useAuth } from '../auth/AuthContext';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EMPTY_ADMIN = { nombre: '', correo: '', password: '', rol: 'ADMIN_CONTENT' };

const ROL_STYLE = {
  ADMIN_SYSTEM: { bg: '#E3F2FD', fg: '#1565C0', label: 'Admin Sistema' },
  ADMIN_CONTENT: { bg: '#F3E5F5', fg: '#6A1B9A', label: 'Admin Contenido' },
  USER: { bg: 'var(--green-light)', fg: 'var(--green-dark)', label: 'Ciudadano' },
};

export default function Usuarios() {
  const { data, loading, error, reload } = useList(usuariosApi.list);
  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_ADMIN);
  const [saving, setSaving] = useState(false);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setForm(EMPTY_ADMIN); setCreating(true); };

  const createAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usuariosApi.createAdmin(form);
      toast.success(`Cuenta ${form.rol === 'ADMIN_SYSTEM' ? 'de Sistema' : 'de Contenido'} creada.`);
      setCreating(false);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u) => {
    const ok = await confirm({
      title: 'Eliminar usuario',
      message: `Se eliminará permanentemente a "${u.nombre}" (${u.correo}). Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    try {
      await usuariosApi.remove(u.id);
      toast.success('Usuario eliminado.');
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (loading) return <Loader label="Cargando usuarios…" />;

  const filtered = q
    ? data.filter((u) => `${u.nombre} ${u.correo}`.toLowerCase().includes(q.toLowerCase()))
    : data;

  return (
    <>
      <PageHeader title="Usuarios" subtitle={`${data.length} cuentas registradas`}>
        <div className="searchbox">
          <span className="leading"><Icon name="search" size={17} /></span>
          <input className="input" placeholder="Buscar por nombre o correo…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Icon name="plus" size={17} /> Crear admin
        </button>
      </PageHeader>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="users" title="Sin usuarios" hint="No se encontraron cuentas." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Puntos</th>
                  <th>Nivel</th>
                  <th>Origen</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const r = ROL_STYLE[u.rol] || ROL_STYLE.USER;
                  const isSelf = u.id === user?.id;
                  return (
                    <tr key={u.id}>
                      <td className="cell-title">{u.nombre}</td>
                      <td className="muted">{u.correo}</td>
                      <td><span className="badge" style={{ background: r.bg, color: r.fg }}>{r.label}</span></td>
                      <td>{u.puntosActuales ?? 0}</td>
                      <td>{u.nivelActual ?? 1}</td>
                      <td className="muted">{u.provider || 'LOCAL'}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn btn-icon btn-ghost"
                            title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                            disabled={isSelf}
                            onClick={() => remove(u)}
                          >
                            <Icon name="trash" size={17} color="var(--error)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={creating}
        title="Crear cuenta de administrador"
        onClose={() => setCreating(false)}
        width={520}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={createAdmin} disabled={saving}>{saving ? 'Creando…' : 'Crear cuenta'}</button>
          </>
        }
      >
        <form onSubmit={createAdmin}>
          <div className="field">
            <label>Tipo de administrador *</label>
            <select className="select" value={form.rol} onChange={setField('rol')}>
              <option value="ADMIN_CONTENT">Admin de Contenido</option>
              <option value="ADMIN_SYSTEM">Admin de Sistema</option>
            </select>
          </div>
          <div className="field">
            <label>Nombre *</label>
            <input className="input" value={form.nombre} onChange={setField('nombre')} required />
          </div>
          <div className="field">
            <label>Correo *</label>
            <input className="input" type="email" value={form.correo} onChange={setField('correo')} required placeholder="editor@educambiental.com" />
          </div>
          <div className="field">
            <label>Contraseña *</label>
            <input className="input" type="password" value={form.password} onChange={setField('password')} required minLength={6} placeholder="Mínimo 6 caracteres" />
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: -4 }}>
            La cuenta queda activa de inmediato (sin verificación por correo).
          </p>
        </form>
      </Modal>
    </>
  );
}
