import { useState } from 'react';
import { useList } from '../hooks/useList';
import { recompensasApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/Confirm';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const EMPTY = { tiendaFicticia: '', descripcion: '', costoPuntos: 500, stock: 10 };

export default function Recompensas() {
  const { data, loading, error, reload } = useList(recompensasApi.list);
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (r) => { setForm({ ...EMPTY, ...r }); setEditing(r); };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dto = { ...form, costoPuntos: parseInt(form.costoPuntos, 10) || 0, stock: parseInt(form.stock, 10) || 0 };
      if (editing.id) { await recompensasApi.update(editing.id, dto); toast.success('Recompensa actualizada.'); }
      else { await recompensasApi.create(dto); toast.success('Recompensa creada.'); }
      setEditing(null);
      reload();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async (r) => {
    const ok = await confirm({ title: 'Eliminar recompensa', message: `¿Eliminar la recompensa de "${r.tiendaFicticia}"?`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    try { await recompensasApi.remove(r.id); toast.success('Recompensa eliminada.'); reload(); }
    catch (err) { toast.error(errMsg(err)); }
  };

  if (loading) return <Loader label="Cargando recompensas…" />;

  return (
    <>
      <PageHeader title="Recompensas" subtitle="Cupones y beneficios canjeables por XP">
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={17} /> Nueva recompensa</button>
      </PageHeader>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : data.length === 0 ? (
          <EmptyState icon="gift" title="Sin recompensas" hint="Crea la primera recompensa canjeable." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr><th>Tienda</th><th>Descripción</th><th>Costo (XP)</th><th>Stock</th><th style={{ width: 100 }}></th></tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-title">{r.tiendaFicticia}</td>
                    <td className="muted clamp2">{r.descripcion}</td>
                    <td><span className="badge" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>{r.costoPuntos} XP</span></td>
                    <td>
                      <span style={{ color: r.stock > 0 ? 'var(--text-input)' : 'var(--error)', fontWeight: 600 }}>
                        {r.stock > 0 ? r.stock : 'Agotado'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-icon btn-ghost" title="Editar" onClick={() => openEdit(r)}><Icon name="edit" size={16} /></button>
                        <button className="btn btn-icon btn-ghost" title="Eliminar" onClick={() => remove(r)}><Icon name="trash" size={16} color="var(--error)" /></button>
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
        title={editing?.id ? 'Editar recompensa' : 'Nueva recompensa'}
        onClose={() => setEditing(null)}
        width={540}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </>
        }
      >
        <form onSubmit={save}>
          <div className="field">
            <label>Tienda / marca *</label>
            <input className="input" value={form.tiendaFicticia} onChange={set('tiendaFicticia')} required placeholder="EcoMarket, Café Verde…" />
          </div>
          <div className="field">
            <label>Descripción *</label>
            <textarea className="textarea" value={form.descripcion} onChange={set('descripcion')} required placeholder="20% de descuento en…" />
          </div>
          <div className="row gap-12">
            <div className="field grow">
              <label>Costo en XP *</label>
              <input className="input" type="number" min="0" value={form.costoPuntos} onChange={set('costoPuntos')} required />
            </div>
            <div className="field grow">
              <label>Stock *</label>
              <input className="input" type="number" min="0" value={form.stock} onChange={set('stock')} required />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
