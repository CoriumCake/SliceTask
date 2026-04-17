import { useToastStore } from '@/store/toastStore'
import Toast from './Toast'
import './UI.css'

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default ToastContainer
