# EducAmbiental · Panel de Administración

Panel web (React + Vite) para operar las funciones administrativas de EducAmbiental
que **no** están en la app móvil del ciudadano. Consume la misma API REST de Spring Boot
y reutiliza los colores, logo y estilo de la app móvil.

## Roles y secciones

El login acepta únicamente cuentas administrativas (un `USER` ciudadano es rechazado).
Las secciones visibles dependen del rol devuelto por el backend:

| Rol | Secciones | RF |
|-----|-----------|----|
| **ADMIN_SYSTEM** | Dashboard · Tickets · Usuarios · Centros | RF19, RF12, RF4, RF10/11 |
| **ADMIN_CONTENT** | Contenido · Módulos · Materiales · Categorías · Recompensas | RF13, RF14, RF6, RF16 |

Cada sección tiene CRUD completo (crear/editar/eliminar) contra los endpoints reales.
El backend además valida cada acción vía `@PreAuthorize`, así que la UI y el servidor
están alineados.

## Configuración

La URL del backend se toma de `VITE_API_URL` (por defecto `http://localhost:8080`).
Si tu backend corre en otra IP/puerto, crea un archivo `.env`:

```
VITE_API_URL=http://192.168.100.178:8080
```

> El backend ya tiene CORS abierto (`SecurityConfig`), así que no requiere cambios.

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción a /dist
npm run preview  # previsualizar el build
npm run lint     # linter
```

## Arquitectura

```
src/
├── api/
│   ├── client.js       # fetch + token JWT + manejo de 401/403
│   └── services.js     # un objeto por recurso (1 función = 1 endpoint)
├── auth/
│   └── AuthContext.jsx # login/logout, persistencia de sesión, roles
├── components/         # Layout, Modal, Toast, Confirm, Icon, ui (Loader…)
├── hooks/
│   └── useList.js      # carga de listas con loading/error/reload
├── pages/              # una página por sección administrativa
├── index.css           # design tokens (paleta idéntica a la app móvil)
└── layout.css          # sidebar, topbar, login, modal, tablas…
```

El token JWT se guarda en `localStorage`; un `401` cierra la sesión automáticamente.
