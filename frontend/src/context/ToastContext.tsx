import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  showToast: () => {},
  addToast: () => {},
  removeToast: () => {}
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 3500) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, addToast: showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-rajdhani font-semibold cursor-pointer transition-all glass-panel shadow-lg
            ${t.type === 'success' ? 'border-neon-green/50 text-neon-green' : ''}
            ${t.type === 'error' ? 'border-neon-red/50 text-neon-red' : ''}
            ${t.type === 'info' ? 'border-neon-cyan/50 text-neon-cyan' : ''}
            ${t.type === 'warning' ? 'border-neon-gold/50 text-neon-gold' : ''}
          `}
        >
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : t.type === 'warning' ? '⚠' : 'ℹ'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => useContext(ToastContext);
