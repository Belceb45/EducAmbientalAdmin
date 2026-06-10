import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/services';
import { TOKEN_KEY, setUnauthorizedHandler, ApiError } from '../api/client';

const USER_KEY = 'ea_admin_user';
const AuthContext = createContext(null);

export const ROLES = {
  SYSTEM: 'ADMIN_SYSTEM',
  CONTENT: 'ADMIN_CONTENT',
};

const isAdmin = (rol) => rol === ROLES.SYSTEM || rol === ROLES.CONTENT;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Si el cliente HTTP detecta un 401, cerramos sesión automáticamente.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    if (!isAdmin(res.rol)) {
      throw new ApiError('Esta cuenta no tiene permisos de administrador.', 403);
    }
    localStorage.setItem(TOKEN_KEY, res.token);
    const profile = {
      id: res.id,
      nombre: res.nombre,
      correo: res.correo,
      rol: res.rol,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isSystem: user?.rol === ROLES.SYSTEM,
    isContent: user?.rol === ROLES.CONTENT,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
