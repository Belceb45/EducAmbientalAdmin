import { useList } from '../hooks/useList';
import { dashboardApi } from '../api/services';
import { Loader, PageHeader, errMsg } from '../components/ui';
import Icon from '../components/Icon';

const STAT_DEFS = [
  { key: 'totalUsuarios', label: 'Usuarios registrados', icon: 'users', color: 'var(--green)', bg: 'var(--green-light)' },
  { key: 'usuariosVerificados', label: 'Usuarios verificados', icon: 'check', color: 'var(--teal)', bg: '#E0F2F1' },
  { key: 'totalCentros', label: 'Centros de acopio', icon: 'pin', color: 'var(--blue)', bg: '#E3F2FD' },
  { key: 'totalMateriales', label: 'Materiales', icon: 'box', color: 'var(--purple)', bg: '#F3E5F5' },
  { key: 'totalContenidos', label: 'Contenidos publicados', icon: 'file', color: 'var(--orange)', bg: '#FFF3E0' },
  { key: 'ticketsAbiertos', label: 'Tickets abiertos', icon: 'inbox', color: 'var(--pink)', bg: '#FCE4EC' },
];

const ESTADO_COLORS = {
  ABIERTO: 'var(--blue)',
  EN_PROGRESO: 'var(--orange)',
  RESUELTO: 'var(--green)',
  CERRADO: 'var(--gray-label)',
};
const ESTADO_LABEL = {
  ABIERTO: 'Abierto',
  EN_PROGRESO: 'En progreso',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
};

export default function Dashboard() {
  const { data, loading, error } = useList(dashboardApi.metrics);
  const m = data || {};

  if (loading) return <Loader label="Cargando métricas…" />;

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Métricas globales de la plataforma" />
        <div className="card card-pad" style={{ color: 'var(--error)' }}>
          <Icon name="alert" /> {errMsg(error)}
        </div>
      </>
    );
  }

  const estados = m.ticketsPorEstado || {};
  const maxTickets = Math.max(1, ...Object.values(estados));
  const order = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Resumen general de EducAmbiental" />

      <div className="stat-grid">
        {STAT_DEFS.map((s) => (
          <div key={s.key} className="card stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <Icon name={s.icon} size={24} color={s.color} />
            </div>
            <div>
              <div className="stat-value">{m[s.key] ?? 0}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <h3 style={{ marginBottom: 18 }}>Tickets por estado</h3>
        {order.map((est) => {
          const count = estados[est] ?? 0;
          return (
            <div key={est} className="bar-row">
              <span className="bar-label">{ESTADO_LABEL[est]}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(count / maxTickets) * 100}%`, background: ESTADO_COLORS[est] }}
                />
              </div>
              <span className="bar-count">{count}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
