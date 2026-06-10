import { useState, useEffect } from 'react';
import { useList } from '../hooks/useList';
import { materialesApi, categoriasApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EMPTY = { nombre: '', instruccionesReciclaje: '', imagenUrl: '', idCategoria: '' };

export default function Materiales() {
  const { data, loading, error, reload } = useList(materialesApi.list);
  const toast = useToast();
  const confirm = useConfirm();
  const [categorias, setCategorias] = useState([]);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoriasApi.list().then((c) => setCategorias(Array.isArray(c) ? c : [])).catch(() => {});
  }, []);

  const openNew = () => { setForm({ ...EMPTY, idCategoria: categorias[0]?.id ?? '' }); setEditing({}); };
  const openEdit = (m) => {
    setForm({ nombre: m.nombre, instruccionesReciclaje: m.instruccionesReciclaje || '', imagenUrl: m.imagenUrl || '', idCategoria: m.categoria?.id ?? '' });
    setEditing(m);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dto = { ...form, idCategoria: form.idCategoria ? Number(form.idCategoria) : null };
      if (editing.id) { await materialesApi.update(editing.id, dto); toast.success('Material actualizado.'); }
      else { await materialesApi.create(dto); toast.success('Material creado.'); }
      setEditing(null);
      reload();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async (m) => {
    const ok = await confirm({ title: 'Eliminar material', message: `¿Eliminar "${m.nombre}"?`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await materialesApi.remove(m.id); toast.success('Material eliminado.'); reload(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  if (loading) return <Loader label="Cargando materiales…" />;

  const filtered = q ? data.filter((m) => m.nombre.toLowerCase().includes(q.toLowerCase())) : data;

  return (
    <>
      <PageHeader title="Materiales" subtitle={`${data.length} materiales en el catálogo`}>
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={17} /> Nuevo material</button>
      </PageHeader>

      <div className="searchbox" style={{ marginBottom: 16 }}>
        <span className="leading"><Icon name="search" size={17} /></span>
        <input className="input" placeholder="Buscar material…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="box" title="Sin materiales" hint="Agrega el primer material al catálogo." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Material</th><th>Categoría</th><th>Instrucciones</th><th style={{ width: 100 }}></th></tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td className="cell-title">{m.nombre}</td>
                    <td>
                      {m.categoria ? (
                        <span className="badge" style={{ background: (m.categoria.color || '#999') + '22', color: m.categoria.color || 'var(--text-input)' }}>
                          {m.categoria.nombre}
                        </span>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td className="muted clamp2">{m.instruccionesReciclaje || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-icon btn-ghost" title="Editar" onClick={() => openEdit(m)}><Icon name="edit" size={16} /></button>
                        <button className="btn btn-icon btn-ghost" title="Eliminar" onClick={() => remove(m)}><Icon name="trash" size={16} color="var(--error)" /></button>
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
        title={editing?.id ? 'Editar material' : 'Nuevo material'}
        onClose={() => setEditing(null)}
        width={560}
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
            <label>Categoría *</label>
            <select className="select" value={form.idCategoria} onChange={set('idCategoria')} required>
              <option value="" disabled>Selecciona una categoría…</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {categorias.length === 0 && <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Primero crea una categoría en la sección «Categorías».</p>}
          </div>
          <div className="field">
            <label>URL de imagen</label>
            <input className="input" value={form.imagenUrl} onChange={set('imagenUrl')} placeholder="https://…supabase…/imagen.png" />
            <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Imagen alusiva del material. Se reutiliza en las guías de esta misma categoría.</p>
            {form.imagenUrl ? (
              <img src={form.imagenUrl} alt="" style={{ marginTop: 10, maxHeight: 120, borderRadius: 8, objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : null}
          </div>
          <div className="field">
            <label>Instrucciones de reciclaje</label>
            <textarea className="textarea" value={form.instruccionesReciclaje} onChange={set('instruccionesReciclaje')} placeholder="Cómo limpiar, separar y desechar…" />
          </div>
        </form>
      </Modal>
    </>
  );
}
