import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X, ShoppingBag } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold transition-all transform animate-in fade-in slide-in-from-top-4 ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : isError
                ? 'bg-red-50 text-red-900 border-red-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {toast.actionLabel && toast.actionPath && (
                <button
                  type="button"
                  onClick={() => {
                    navigate(toast.actionPath!);
                    removeToast(toast.id);
                  }}
                  className="flex items-center gap-1 bg-black hover:bg-[#c40d00] text-white text-[11px] font-black px-2.5 py-1.5 rounded-xl transition-colors shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{toast.actionLabel}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
