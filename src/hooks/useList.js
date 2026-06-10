import { useState, useEffect, useCallback } from 'react';

// Hook genérico para cargar una lista desde el backend con estado de carga/error
// y una función `reload` para refrescar tras crear/editar/eliminar.
export function useList(fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}
