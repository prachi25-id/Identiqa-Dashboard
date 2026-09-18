import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const Icon = icons[type] || Info

  return (
    <div className={`toast ${type}`}>
      <Icon size={20} />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="btn-icon"
        style={{ 
          width: 'auto', 
          padding: '0 8px', 
          border: 'none',
          background: 'none'
        }}
      >
        <X size={18} />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState(null)

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration })
  }

  const closeToast = () => {
    setToast(null)
  }

  return { toast, showToast, closeToast }
}
