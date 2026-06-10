import { useState } from 'react';
import { useList } from '../hooks/useList';
import { ticketsApi } from '../api/services';
import { Loader, EmptyState, PageHeader, errMsg } from '../components/ui';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';

const ESTADOS = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];
const ESTADO_STYLE = {
  ABIERTO: { bg: '#E3F2FD', fg: '#1565C0' },
  EN_PROGRESO: { bg: '#FFF3E0', fg: '#E65100' },
  RESUELTO: { bg: 'var(--green-light)', fg: 'var(--green-dark)' },
  CERRADO: { bg: '#ECEFF1', fg: '#546E7A' },
};
const PRIORIDAD_STYLE = {
  ALTA: { bg: '#FDECEA', fg: '#C62828' },
  MEDIA: { bg: '#FFF3E0', fg: '#E65100' },
  BAJA: { bg: '#E8F5E9', fg: '#2E7D32' },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const label = (s) => s.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export default function Tickets() {
  const { data, loading, error, reload } = useList(ticketsApi.list);
  const toast = useToast();
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('TODOS');

  const changeEstado = async (ticket, nuevoEstado) => {
    if (nuevoEstado === ticket.estado) return;
    setSavingId(ticket.id);
    try {
      await ticketsApi.setEstado(ticket.id, nuevoEstado);
      toast.success(`Ticket actualizado a "${label(nuevoEstado)}".`);
      reload();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <Loader label="Cargando tickets…" />;

  const filtered = filter === 'TODOS' ? data : data.filter((t) => t.estado === filter);

  return (
    <>
      <PageHeader title="Tickets de soporte" subtitle="Gestiona los reportes y dudas de los usuarios" />

      <div className="tabs">
        {['TODOS', ...ESTADOS].map((est) => (
          <button key={est} className={`tab ${filter === est ? 'active' : ''}`} onClick={() => setFilter(est)}>
            {est === 'TODOS' ? 'Todos' : label(est)}
          </button>
        ))}
      </div>

      <div className="card">
        {error ? (
          <div className="card-pad" style={{ color: 'var(--error)' }}><Icon name="alert" /> {errMsg(error)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="inbox" title="Sin tickets" hint="No hay tickets en esta vista." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Asunto</th>
                  <th>Usuario</th>
                  <th>Prioridad</th>
                  <th>Creado</th>
                  <th style={{ width: 170 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const pr = PRIORIDAD_STYLE[t.prioridad] || PRIORIDAD_STYLE.MEDIA;
                  const es = ESTADO_STYLE[t.estado] || ESTADO_STYLE.ABIERTO;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="cell-title">{t.titulo}</div>
                        <div className="muted clamp2" style={{ fontSize: 13 }}>{t.descripcion}</div>
                      </td>
                      <td>{t.nombreUsuarioReporta || '—'}</td>
                      <td>
                        <span className="badge" style={{ background: pr.bg, color: pr.fg }}>{t.prioridad || 'MEDIA'}</span>
                      </td>
                      <td className="muted">{fmtDate(t.fechaCreacion)}</td>
                      <td>
                        <select
                          className="select"
                          value={t.estado}
                          disabled={savingId === t.id}
                          onChange={(e) => changeEstado(t, e.target.value)}
                          style={{ background: es.bg, color: es.fg, fontWeight: 700, border: 'none', borderRadius: 20, padding: '8px 12px' }}
                        >
                          {ESTADOS.map((e) => <option key={e} value={e} style={{ background: '#fff', color: 'var(--text-input)' }}>{label(e)}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
