import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // El patrón de cargar datos del backend dentro de useEffect dispara este
      // chequeo (v7 del plugin). Es el patrón documentado para data-fetching,
      // así que lo dejamos como aviso y no como error.
      'react-hooks/set-state-in-effect': 'warn',
      // Avisos de granularidad de Fast Refresh (HMR). Exportar el Provider y su
      // hook desde el mismo archivo de contexto es intencional; no es un bug.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
