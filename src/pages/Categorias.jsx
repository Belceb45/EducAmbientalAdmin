import { useState } from 'react';
import { useList } from '../hooks/useList';
import { categoriasApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EMPTY = { nombre: '', descripcion: '', instruccionesGenerales: '', icono: '', color: '#43A047' };

export default function Categorias() {
  const { data, loading, error, reload } = useList(categoriasApi.list);
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => { setForm({ ...EMPTY, ...c, color: c.color || '#43A047' }); setEditing(c); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) { await categoriasApi.update(editing.id, form); toast.success('Categoría actualizada.'); }
      else { await categoriasApi.create(form); toast.success('Categoría creada.'); }
      setEditing(null);
      reload();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async (c) => {
    const ok = await confirm({ title: 'Eliminar categoría', message: `¿Eliminar "${c.nombre}"? Los materiales asociados podrían verse afectados.`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await categoriasApi.remove(c.id); toast.success('Categoría eliminada.'); reload(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  if (loading) return <Loader label="Cargando categorías…" />;

  const list = Array.isArray(data) ? data : [];

  return (
    <>
      <PageHeader title="Categorías de residuo" subtitle="Agrupan los materiales del catálogo (plástico, vidrio, papel…)">
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={17} /> Nueva categoría</button>
      </PageHeader>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : list.length === 0 ? (
          <EmptyState icon="tag" title="Sin categorías" hint="Crea la primera categoría de residuos." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Color</th><th>Nombre</th><th>Descripción</th><th>Icono</th><th style={{ width: 100 }}></th></tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td><span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: 7, background: c.color || '#ccc', border: '1px solid #0001' }} /></td>
                    <td className="cell-title">{c.nombre}</td>
                    <td className="muted clamp2">{c.descripcion}</td>
                    <td className="mono">{c.icono || '—'}</td>
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
        title={editing?.id ? 'Editar categoría' : 'Nueva categoría'}
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
          <div className="row gap-12">
            <div className="field grow">
              <label>Nombre *</label>
              <input className="input" value={form.nombre} onChange={set('nombre')} required />
            </div>
            <div className="field" style={{ width: 110 }}>
              <label>Color</label>
              <input className="input" type="color" style={{ height: 44, padding: 4 }} value={form.color} onChange={set('color')} />
            </div>
          </div>
          <div className="field">
            <label>Descripción</label>
            <input className="input" value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <div className="field">
            <label>Instrucciones generales</label>
            <textarea className="textarea" value={form.instruccionesGenerales} onChange={set('instruccionesGenerales')} />
          </div>
          <div className="field">
            <label>Icono (nombre Ionicons)</label>
            <input className="input" value={form.icono} onChange={set('icono')} placeholder="water, leaf, wine…" />
          </div>
        </form>
      </Modal>
    </>
  );
}
