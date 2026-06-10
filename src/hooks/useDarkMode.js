import { useEffect, useState } from 'react';

const KEY = 'admin_theme';

export function getStoredTheme() {
  const stored = localStorage.getItem(KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

// Aplica el tema al <html> mediante data-theme; el CSS hace el resto vía variables.
export function applyTheme(isDark) {
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem(KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((v) => !v) };
}
