import { useState } from 'react';
import { useList } from '../hooks/useList';
import { centrosApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EMPTY = { nombre: '', direccion: '', latitud: '', longitud: '', horario: '', contacto: '', imagenUrl: '', descripcion: '' };

export default function Centros() {
  const { data, loading, error, reload } = useList(centrosApi.list);
  const toast = useToast();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | {} (nuevo) | centro
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => {
    setForm({ ...EMPTY, ...c, latitud: c.latitud ?? '', longitud: c.longitud ?? '' });
    setEditing(c);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dto = {
        ...form,
        latitud: form.latitud === '' ? null : parseFloat(form.latitud),
        longitud: form.longitud === '' ? null : parseFloat(form.longitud),
      };
      if (editing.id) {
        await centrosApi.update(editing.id, dto);
        toast.success('Centro actualizado.');
      } else {
        await centrosApi.create(dto);
        toast.success('Centro creado.');
      }
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    const ok = await confirm({ title: 'Eliminar centro', message: `¿Eliminar "${c.nombre}"?`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await centrosApi.remove(c.id); toast.success('Centro eliminado.'); reload(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  const runAction = async (fn, msg) => {
    setBusy(true);
    try { await fn(); toast.success(msg); reload(); }
    catch (err) { toast.error(errMsg(err)); }
    finally { setBusy(false); }
  };

  if (loading) return <Loader label="Cargando centros…" />;

  const list = Array.isArray(data) ? data : [];
  const filtered = q ? list.filter((c) => `${c.nombre} ${c.direccion}`.toLowerCase().includes(q.toLowerCase())) : list;

  return (
    <>
      <PageHeader title="Centros de acopio" subtitle={`${list.length} centros registrados`}>
        <button className="btn btn-ghost" disabled={busy} onClick={() => runAction(centrosApi.sincronizar, 'Sincronización con CDMX completada.')}>
          <Icon name="refresh" size={17} /> Sincronizar CDMX
        </button>
        <button className="btn btn-ghost" disabled={busy} onClick={() => runAction(centrosApi.importarCsv, 'Importación CSV iniciada.')}>
          <Icon name="upload" size={17} /> Importar CSV
        </button>
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={17} /> Nuevo centro</button>
      </PageHeader>

      <div className="searchbox" style={{ marginBottom: 16 }}>
        <span className="leading"><Icon name="search" size={17} /></span>
        <input className="input" placeholder="Buscar centro…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="pin" title="Sin centros" hint="Crea uno nuevo o sincroniza con Datos Abiertos CDMX." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Nombre</th><th>Dirección</th><th>Horario</th><th>Contacto</th><th style={{ width: 100 }}></th></tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-title">{c.nombre}</td>
                    <td className="muted clamp2">{c.direccion}</td>
                    <td className="muted">{c.horario || '—'}</td>
                    <td className="muted">{c.contacto || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-icon btn-ghost" title="Editar" onClick={() => openEdit(c)}><Icon name="edit" size={16} /></button>
                        <button className="btn btn-icon btn-ghost" title="Eliminar" onClick={() => remove(c)}><Icon name="trash" size={16} color="var(--error)" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!editing}
        title={editing?.id ? 'Editar centro' : 'Nuevo centro'}
        onClose={() => setEditing(null)}
        width={580}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        }
      >
        <form onSubmit={save}>
          <div className="field">
            <label>Nombre *</label>
            <input className="input" value={form.nombre} onChange={set('nombre')} required />
          </div>
          <div className="field">
            <label>Dirección *</label>
            <input className="input" value={form.direccion} onChange={set('direccion')} required />
          </div>
          <div className="row gap-12">
            <div className="field grow">
              <label>Latitud</label>
              <input className="input" type="number" step="any" value={form.latitud} onChange={set('latitud')} placeholder="19.4326" />
            </div>
            <div className="field grow">
              <label>Longitud</label>
              <input className="input" type="number" step="any" value={form.longitud} onChange={set('longitud')} placeholder="-99.1332" />
            </div>
          </div>
          <div className="row gap-12">
            <div className="field grow">
              <label>Horario</label>
              <input className="input" value={form.horario} onChange={set('horario')} placeholder="Lun-Vie 9:00-18:00" />
            </div>
            <div className="field grow">
              <label>Contacto</label>
              <input className="input" value={form.contacto} onChange={set('contacto')} placeholder="55 1234 5678" />
            </div>
          </div>
          <div className="field">
            <label>URL de imagen</label>
            <input className="input" value={form.imagenUrl} onChange={set('imagenUrl')} placeholder="https://…" />
          </div>
          <div className="field">
            <label>Descripción / materiales que acepta</label>
            <textarea className="textarea" value={form.descripcion} onChange={set('descripcion')} />
          </div>
        </form>
      </Modal>
    </>
  );
}
