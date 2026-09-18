import React from 'react'
import { AlertTriangle } from 'lucide-react'

export function DeleteConfirmation({
  isOpen,
  title,
  message,
  childCount,
  onConfirm,
  onCancel,
  isDeleting,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px' }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            {message}
          </p>
          {childCount > 0 && (
            <p style={{ color: '#f59e0b', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
              ⚠️ This tool has {childCount} sub-tool{childCount !== 1 ? 's' : ''}. 
              {childCount === 1 ? ' Deleting it will also remove this sub-tool.' : ' Deleting it will also remove these sub-tools.'}
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
