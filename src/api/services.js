// Servicios por recurso. Cada función mapea 1:1 a un endpoint del backend.
import { http, unwrapPage } from './client';

const PAGE = '?page=0&size=200&sort=id';

export const authApi = {
  login: (email, password) => http.post('/api/auth/authenticate', { email, password }),
};

// ── RF19 · Dashboard administrativo (ADMIN_SYSTEM) ───────────────────────────
export const dashboardApi = {
  metrics: () => http.get('/api/dashboard/admin'),
};

// ── RF12 · Tickets (ADMIN_SYSTEM) ────────────────────────────────────────────
export const ticketsApi = {
  list: async () => unwrapPage(await http.get(`/api/tickets${PAGE}`)),
  setEstado: (id, nuevoEstado) =>
    http.patch(`/api/tickets/${id}/estado?nuevoEstado=${nuevoEstado}`),
  asignar: (id, idAdmin) => http.patch(`/api/tickets/${id}/asignar/${idAdmin}`),
};

// ── RF4 · Usuarios (ADMIN_SYSTEM) ────────────────────────────────────────────
export const usuariosApi = {
  list: async () => unwrapPage(await http.get(`/api/usuarios${PAGE}`)),
  remove: (id) => http.del(`/api/usuarios/${id}`),
  // Crear cuenta administrativa (ADMIN_SYSTEM o ADMIN_CONTENT).
  createAdmin: (dto) => http.post('/api/usuarios/admin', dto),
};

// ── RF10/11 · Centros de reciclaje (ADMIN_SYSTEM) ────────────────────────────
export const centrosApi = {
  list: () => http.get('/api/centros'),
  create: (dto) => http.post('/api/centros', dto),
  update: (id, dto) => http.put(`/api/centros/${id}`, dto),
  remove: (id) => http.del(`/api/centros/${id}`),
  sincronizar: () => http.post('/api/centros/sincronizar'),
  importarCsv: () => http.post('/api/centros/importar-csv'),
};

// ── RF13 · Contenido estático: TIP / ARTICULO / GUIA (ADMIN_CONTENT) ─────────
export const contenidoApi = {
  byType: (tipo) => http.get(`/api/contenido/tipo/${tipo}`),
  create: (dto) => http.post('/api/contenido', dto),
  update: (id, dto) => http.put(`/api/contenido/${id}`, dto),
  remove: (id) => http.del(`/api/contenido/${id}`),
};

// ── RF13/RF14 · Módulos educativos (ADMIN_CONTENT) ───────────────────────────
export const modulosApi = {
  list: async () => unwrapPage(await http.get(`/api/modulos-educativos${PAGE}`)),
  create: (dto) => http.post('/api/modulos-educativos', dto),
  update: (id, dto) => http.put(`/api/modulos-educativos/${id}`, dto),
  remove: (id) => http.del(`/api/modulos-educativos/${id}`),
};

// ── RF6 · Materiales del catálogo (ADMIN_CONTENT) ────────────────────────────
export const materialesApi = {
  list: async () => unwrapPage(await http.get(`/api/materiales${PAGE}`)),
  create: (dto) => http.post('/api/materiales', dto),
  update: (id, dto) => http.put(`/api/materiales/${id}`, dto),
  remove: (id) => http.del(`/api/materiales/${id}`),
};

// ── RF6 · Categorías de residuo (ADMIN_CONTENT) ──────────────────────────────
export const categoriasApi = {
  list: () => http.get('/api/categorias'),
  create: (dto) => http.post('/api/categorias', dto),
  update: (id, dto) => http.put(`/api/categorias/${id}`, dto),
  remove: (id) => http.del(`/api/categorias/${id}`),
};

// ── RF16 · Recompensas (ADMIN_CONTENT) ───────────────────────────────────────
export const recompensasApi = {
  list: async () => unwrapPage(await http.get(`/api/recompensas${PAGE}`)),
  create: (dto) => http.post('/api/recompensas', dto),
  update: (id, dto) => http.put(`/api/recompensas/${id}`, dto),
  remove: (id) => http.del(`/api/recompensas/${id}`),
};
