import { useState, useEffect, useCallback } from 'react';
import { contenidoApi, categoriasApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const TIPOS = [
  { id: 'TIP', label: 'Tips', icon: 'award' },
  { id: 'ARTICULO', label: 'Artículos', icon: 'file' },
  { id: 'GUIA', label: 'Guías', icon: 'book' },
];

export default function Contenido() {
  const toast = useToast();
  const confirm = useConfirm();
  const [tipo, setTipo] = useState('TIP');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ titulo: '', cuerpo: '', autor: '', idCategoria: '' });
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const load = useCallback(async (t) => {
    setLoading(true); setError(null);
    try { setData(await contenidoApi.byType(t) || []); }
    catch (e) { setError(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(tipo); }, [tipo, load]);

  useEffect(() => {
    categoriasApi.list().then((c) => setCategorias(Array.isArray(c) ? c : [])).catch(() => {});
  }, []);

  const openNew = () => { setForm({ titulo: '', cuerpo: '', autor: '', idCategoria: '' }); setEditing({}); };
  const openEdit = (c) => { setForm({ titulo: c.titulo, cuerpo: c.cuerpo, autor: c.autor || '', idCategoria: c.idCategoria ?? '' }); setEditing(c); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dto = { ...form, tipo, idCategoria: form.idCategoria ? Number(form.idCategoria) : null };
      if (editing.id) { await contenidoApi.update(editing.id, dto); toast.success('Contenido actualizado.'); }
      else { await contenidoApi.create(dto); toast.success('Contenido creado.'); }
      setEditing(null);
      load(tipo);
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async (c) => {
    const ok = await confirm({ title: 'Eliminar contenido', message: `¿Eliminar "${c.titulo}"?`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await contenidoApi.remove(c.id); toast.success('Contenido eliminado.'); load(tipo); }
    catch (err) { toast.error(errMsg(err)); }
  };

  const tipoLabel = TIPOS.find((t) => t.id === tipo)?.label;

  return (
    <>
      <PageHeader title="Gestión de contenido" subtitle="Tips, artículos y guías que ven los ciudadanos">
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={17} /> Nuevo</button>
      </PageHeader>

      <div className="tabs">
        {TIPOS.map((t) => (
          <button key={t.id} className={`tab ${tipo === t.id ? 'active' : ''}`} onClick={() => setTipo(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40 }}><Loader label="Cargando…" /></div>
        ) : error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : data.length === 0 ? (
          <EmptyState icon="file" title={`Sin ${tipoLabel?.toLowerCase()}`} hint="Crea el primer contenido de esta categoría." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Título</th><th>Extracto</th><th>Autor</th><th style={{ width: 100 }}></th></tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-title">{c.titulo}</td>
                    <td className="muted clamp2">{c.cuerpo}</td>
                    <td className="muted">{c.autor || '—'}</td>
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
        title={editing?.id ? `Editar ${tipoLabel}` : `Nuevo ${tipoLabel}`}
        onClose={() => setEditing(null)}
        width={600}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        }
      >
        <form onSubmit={save}>
          <div className="field">
            <label>Título *</label>
            <input className="input" value={form.titulo} onChange={set('titulo')} required />
          </div>
          <div className="field">
            <label>Cuerpo *</label>
            <textarea className="textarea" style={{ minHeight: 160 }} value={form.cuerpo} onChange={set('cuerpo')} required />
          </div>
          {tipo === 'GUIA' && (
            <div className="field">
              <label>Categoría</label>
              <select className="select" value={form.idCategoria} onChange={set('idCategoria')}>
                <option value="">Sin categoría (sin imagen)</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>La imagen de la guía se toma de un material de esta categoría.</p>
            </div>
          )}
          <div className="field">
            <label>Autor</label>
            <input className="input" value={form.autor} onChange={set('autor')} placeholder="Equipo EducAmbiental" />
          </div>
        </form>
      </Modal>
    </>
  );
}
