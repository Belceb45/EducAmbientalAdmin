import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, ROLES } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Usuarios from './pages/Usuarios';
import Centros from './pages/Centros';
import Contenido from './pages/Contenido';
import Modulos from './pages/Modulos';
import Materiales from './pages/Materiales';
import Categorias from './pages/Categorias';
import Recompensas from './pages/Recompensas';

// Redirige la raíz al landing que corresponde según rol (o al login).
function RootRedirect() {
  const { isAuthenticated, isSystem } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isSystem ? '/dashboard' : '/contenido'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* ── ADMIN_SYSTEM ── */}
        <Route path="/dashboard" element={<ProtectedRoute role={ROLES.SYSTEM}><Dashboard /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute role={ROLES.SYSTEM}><Tickets /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute role={ROLES.SYSTEM}><Usuarios /></ProtectedRoute>} />
        <Route path="/centros" element={<ProtectedRoute role={ROLES.SYSTEM}><Centros /></ProtectedRoute>} />

        {/* ── ADMIN_CONTENT ── */}
        <Route path="/contenido" element={<ProtectedRoute role={ROLES.CONTENT}><Contenido /></ProtectedRoute>} />
        <Route path="/modulos" element={<ProtectedRoute role={ROLES.CONTENT}><Modulos /></ProtectedRoute>} />
        <Route path="/materiales" element={<ProtectedRoute role={ROLES.CONTENT}><Materiales /></ProtectedRoute>} />
        <Route path="/categorias" element={<ProtectedRoute role={ROLES.CONTENT}><Categorias /></ProtectedRoute>} />
        <Route path="/recompensas" element={<ProtectedRoute role={ROLES.CONTENT}><Recompensas /></ProtectedRoute>} />
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
