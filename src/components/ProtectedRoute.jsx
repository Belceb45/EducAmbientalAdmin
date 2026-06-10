import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Protege rutas privadas. Si se pasa `role`, exige ese rol concreto y, si no
// coincide, redirige al landing del usuario en vez de mostrar un 403 vacío.
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user, isSystem } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.rol !== role) {
    return <Navigate to={isSystem ? '/dashboard' : '/contenido'} replace />;
  }

  return children;
}
