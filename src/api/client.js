// Cliente HTTP central del panel admin.
// La URL base se puede sobreescribir con VITE_API_URL (.env). Por defecto apunta
// al backend Spring Boot en localhost. CORS está abierto en SecurityConfig.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const TOKEN_KEY = 'ea_admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Error enriquecido con el status para que la UI pueda distinguir 401/403/etc.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(method, endpoint, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. ¿Está encendido el backend?', 0);
  }

  if (res.status === 401 || res.status === 403) {
    // 403 en una acción puntual no siempre implica sesión inválida (puede ser
    // falta de rol), pero 401 sí. Solo forzamos logout en 401.
    if (res.status === 401 && onUnauthorized) onUnauthorized();
    const msg = res.status === 403
      ? 'No tienes permisos para esta acción.'
      : 'Tu sesión expiró. Inicia sesión de nuevo.';
    throw new ApiError(msg, res.status);
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch { /* respuesta sin cuerpo JSON */ }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const http = {
  get: (e) => request('GET', e),
  post: (e, b) => request('POST', e, b),
  put: (e, b) => request('PUT', e, b),
  patch: (e, b) => request('PATCH', e, b),
  del: (e) => request('DELETE', e),
};

// Spring devuelve páginas { content, totalElements, ... }. Normalizamos a array.
export function unwrapPage(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}
