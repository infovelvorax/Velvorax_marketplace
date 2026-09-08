import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { ToastContainer } from '../components'

export const ToastContext = createContext(null)

let toastIdCounter = 0

/**
 * Global Toast provider wrapping the application
 */
export function ToastProvider({ children, position = 'top-right' }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `toast-${++toastIdCounter}`
      const newToast = { id, type, title, message, duration }
      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const toast = useCallback(
    (opts) => {
      if (typeof opts === 'string') {
        return addToast({ message: opts })
      }
      return addToast(opts)
    },
    [addToast]
  )

  toast.success = useCallback((message, title, duration) =>
    addToast({ type: 'success', message, title, duration }), [addToast])

  toast.error = useCallback((message, title, duration) =>
    addToast({ type: 'error', message, title, duration }), [addToast])

  toast.warning = useCallback((message, title, duration) =>
    addToast({ type: 'warning', message, title, duration }), [addToast])

  toast.info = useCallback((message, title, duration) =>
    addToast({ type: 'info', message, title, duration }), [addToast])

  toast.dismiss = dismiss

  const showToast = useCallback(
    (type, message, title, duration) => {
      if (typeof type === 'object' && type !== null) {
        return toast(type)
      }
      return toast({ type, message, title, duration })
    },
    [toast]
  )

  const value = useMemo(() => ({
    toast,
    dismiss,
    showToast
  }), [toast, dismiss, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  )
}

const fallbackToastHandler = {
  toast: Object.assign(
    (opts) => {
      const msg = typeof opts === 'string' ? opts : opts?.message || JSON.stringify(opts);
      console.log('[Toast]', msg);
    },
    {
      success: (msg, title) => console.log('[Toast success]', title ? `${title}: ${msg}` : msg),
      error: (msg, title) => console.error('[Toast error]', title ? `${title}: ${msg}` : msg),
      warning: (msg, title) => console.warn('[Toast warning]', title ? `${title}: ${msg}` : msg),
      info: (msg, title) => console.info('[Toast info]', title ? `${title}: ${msg}` : msg),
      dismiss: () => {}
    }
  ),
  showToast: (type, message, title) => {
    console.log(`[Toast ${type}]`, title ? `${title}: ${message}` : message);
  },
  dismiss: () => {}
};

/**
 * Hook to access global toast trigger methods
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return fallbackToastHandler;
  }
  return context;
}

export default ToastProvider;

