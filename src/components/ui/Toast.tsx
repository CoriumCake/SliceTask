import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import type { ToastType } from '@/store/toastStore'
import './UI.css'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle size={20} color="var(--accent-success)" />,
    error: <AlertCircle size={20} color="var(--accent-danger)" />,
    info: <Info size={20} color="var(--accent-info)" />,
    warning: <AlertTriangle size={20} color="var(--accent-warning)" />,
  }

  return (
    <div className={`toast toast-${type}`}>
      {icons[type]}
      <span style={{ flex: 1, fontSize: '14px' }}>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast
