import { createContext, useContext, useCallback, useRef, useState } from 'react';
import Modal from './Modal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        title: opts.title || '¿Confirmar acción?',
        message: opts.message || '',
        confirmLabel: opts.confirmLabel || 'Confirmar',
        danger: opts.danger ?? false,
      });
    });
  }, []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state}
        title={state?.title}
        onClose={() => close(false)}
        width={440}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => close(false)}>Cancelar</button>
            <button
              className={`btn ${state?.danger ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => close(true)}
            >
              {state?.confirmLabel}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-input)', lineHeight: 1.55, margin: 0 }}>{state?.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
}
