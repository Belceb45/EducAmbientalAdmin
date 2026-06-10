import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../auth/AuthContext';
import { useConfirm } from './Confirm';
import { useDarkMode } from '../hooks/useDarkMode';
import Icon from './Icon';
import logo from '../assets/logo.png';

// Cada entrada declara el rol que la habilita. El backend igual valida por @PreAuthorize.
const NAV = [
  { section: 'Sistema', role: ROLES.SYSTEM, items: [
    { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/tickets', label: 'Tickets', icon: 'inbox' },
    { to: '/usuarios', label: 'Usuarios', icon: 'users' },
    { to: '/centros', label: 'Centros', icon: 'pin' },
  ]},
  { section: 'Contenido', role: ROLES.CONTENT, items: [
    { to: '/contenido', label: 'Contenido', icon: 'file' },
    { to: '/modulos', label: 'Módulos', icon: 'book' },
    { to: '/materiales', label: 'Materiales', icon: 'box' },
    { to: '/categorias', label: 'Categorías', icon: 'tag' },
    { to: '/recompensas', label: 'Recompensas', icon: 'gift' },
  ]},
];

const ROLE_LABEL = {
  [ROLES.SYSTEM]: 'Admin de Sistema',
  [ROLES.CONTENT]: 'Admin de Contenido',
};

function titleFor(pathname) {
  for (const group of NAV) {
    const found = group.items.find((i) => pathname.startsWith(i.to));
    if (found) return found.label;
  }
  return 'Panel';
}

export default function Layout() {
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const location = useLocation();
  const { isDark, toggle } = useDarkMode();
  const [open, setOpen] = useState(false);

  const sections = NAV.filter((g) => g.role === user?.rol);
  const initial = (user?.nombre || '?').trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Cerrar sesión',
      message: '¿Seguro que deseas salir del panel?',
      confirmLabel: 'Cerrar sesión',
    });
    if (ok) logout();
  };

  return (
    <div className="app-shell">
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="EducAmbiental" />
          <div>
            <div className="brand-name">EducAmbiental</div>
            <div className="brand-sub">PANEL ADMIN</div>
          </div>
        </div>

        {sections.map((group) => (
          <div key={group.section}>
            <div className="nav-section-label">{group.section}</div>
            <nav className="nav">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon name={item.icon} size={19} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="user-avatar">{initial}</div>
            <div className="user-meta grow">
              <div className="name">{user?.nombre}</div>
              <div className="role">{ROLE_LABEL[user?.rol] || 'Admin'}</div>
            </div>
            <button className="btn btn-icon btn-ghost" onClick={handleLogout} title="Cerrar sesión">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn btn-icon btn-ghost menu-btn" onClick={() => setOpen(true)}>
            <Icon name="menu" size={20} />
          </button>
          <strong style={{ color: 'var(--text-title)', fontSize: 16 }}>{titleFor(location.pathname)}</strong>
          <button
            className="btn btn-icon btn-ghost"
            onClick={toggle}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            style={{ marginLeft: 'auto' }}
          >
            <Icon name={isDark ? 'sun' : 'moon'} size={19} />
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
