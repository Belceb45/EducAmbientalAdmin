import { useState } from 'react';
import { useList } from '../hooks/useList';
import { modulosApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EMPTY = { titulo: '', descripcion: '', contenido: '', tipo: 'LECCION', puntosOtorgados: 100 };

export default function Modulos() {
  const { data, loading, error, reload } = useList(modulosApi.list);
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (m) => { setForm({ ...EMPTY, ...m }); setEditing(m); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dto = { ...form, puntosOtorgados: parseInt(form.puntosOtorgados, 10) || 0 };
      if (editing.id) { await modulosApi.update(editing.id, dto); toast.success('Módulo actualizado.'); }
      else { await modulosApi.create(dto); toast.success('Módulo creado.'); }
      setEditing(null);
      reload();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async (m) => {
    const ok = await confirm({ title: 'Eliminar módulo', message: `¿Eliminar "${m.titulo}"?`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await modulosApi.remove(m.id); toast.success('Módulo eliminado.'); reload(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  if (loading) return <Loader label="Cargando módulos…" />;

  return (
    <>
      <PageHeader title="Módulos educativos" subtitle="Lecciones que otorgan XP a los ciudadanos">
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={17} /> Nuevo módulo</button>
      </PageHeader>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : data.length === 0 ? (
          <EmptyState icon="book" title="Sin módulos" hint="Crea el primer módulo educativo." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Título</th><th>Descripción</th><th>Tipo</th><th>XP</th><th style={{ width: 100 }}></th></tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id}>
                    <td className="cell-title">{m.titulo}</td>
                    <td className="muted clamp2">{m.descripcion}</td>
                    <td><span className="badge" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>{m.tipo || '—'}</span></td>
                    <td><strong style={{ color: 'var(--green-dark)' }}>+{m.puntosOtorgados ?? 0}</strong></td>
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
        title={editing?.id ? 'Editar módulo' : 'Nuevo módulo'}
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
            <label>Descripción</label>
            <input className="input" value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <div className="field">
            <label>Contenido</label>
            <textarea className="textarea" style={{ minHeight: 140 }} value={form.contenido} onChange={set('contenido')} placeholder="Cuerpo de la lección…" />
          </div>
          <div className="row gap-12">
            <div className="field grow">
              <label>Tipo</label>
              <input className="input" value={form.tipo} onChange={set('tipo')} placeholder="LECCION, TRIVIA…" />
            </div>
            <div className="field grow">
              <label>XP otorgados *</label>
              <input className="input" type="number" min="0" value={form.puntosOtorgados} onChange={set('puntosOtorgados')} required />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
