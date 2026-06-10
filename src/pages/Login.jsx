import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Icon from '../components/Icon';
import { errMsg } from '../components/ui';
import { useDarkMode } from '../hooks/useDarkMode';
import logo from '../assets/logo.png';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggle } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(email.trim(), password);
      const from = location.state?.from?.pathname;
      const fallback = profile.rol === 'ADMIN_SYSTEM' ? '/dashboard' : '/contenido';
      navigate(from || fallback, { replace: true });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <button
        className="btn btn-icon btn-ghost"
        onClick={toggle}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
        style={{ position: 'absolute', top: 16, right: 16 }}
      >
        <Icon name={isDark ? 'sun' : 'moon'} size={20} />
      </button>
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <img src={logo} alt="EducAmbiental" />
          <span className="name">EducAmbiental</span>
        </div>
        <h2 className="login-title">Panel de Administración</h2>
        <p className="login-sub">Ingresa con tu cuenta de administrador</p>

        {error && (
          <div className="login-error">
            <Icon name="alert" size={16} /> {error}
          </div>
        )}

        <div className="field">
          <label>Correo electrónico</label>
          <div className="input-group">
            <span className="leading"><Icon name="users" size={18} /></span>
            <input
              className="input"
              type="email"
              autoComplete="username"
              placeholder="admin@educambiental.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Contraseña</label>
          <div className="input-group">
            <span className="leading"><Icon name="tag" size={18} /></span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <p className="login-foot">Acceso exclusivo para personal autorizado · EducAmbiental © 2026</p>
      </form>
    </div>
  );
}
