import Icon from './Icon';

export function Loader({ label = 'Cargando…' }) {
  return (
    <div className="center-screen">
      <div className="spinner" />
      <span className="muted">{label}</span>
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, hint }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={30} color="var(--gray-label)" /></div>
      <h4>{title}</h4>
      {hint && <p className="muted">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="muted" style={{ marginTop: 4 }}>{subtitle}</p>}
      </div>
      {children && <div className="row gap-12 wrap">{children}</div>}
    </div>
  );
}

// Convierte un error de red en mensaje legible.
export function errMsg(e) {
  return e?.message || 'Ocurrió un error inesperado.';
}
