import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: Toast['type'], duration?: number) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'success', duration = 4000) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type, duration };
        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const getIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="w-6 h-6 text-emerald-500" />;
            case 'error': return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
            case 'warning': return <ExclamationCircleIcon className="w-6 h-6 text-amber-500" />;
            case 'info': return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
        }
    };

    const getStyles = (type: Toast['type']) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'error': return 'bg-red-50 border-red-200 text-red-800';
            case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in ${getStyles(toast.type)}`}
                        style={{
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        {getIcon(toast.type)}
                        <p className="flex-1 font-medium text-sm">{toast.message}</p>
                        <button
                            onClick={() => hideToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </ToastContext.Provider>
    );
};
