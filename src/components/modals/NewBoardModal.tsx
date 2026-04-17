import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import './Modals.css'

interface NewBoardModalProps {
  title?: string
  description?: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

const NewBoardModal = ({ title = 'New Board', description, onConfirm, onCancel }: NewBoardModalProps) => {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onConfirm(name.trim())
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 300 }}>
      <div className="settings-modal" style={{ maxWidth: '400px', height: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <Plus size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '18px' }}>{title}</h2>
          </div>
          <button onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {description || 'Enter a name for your new board. Any current tasks will be archived to history.'}
            </p>
            <div className="settings-control" style={{ marginTop: 'var(--spacing-sm)' }}>
              <label className="settings-compact-label">Board Name</label>
              <input
                autoFocus
                className="modal-input"
                placeholder="e.g. Work Tasks, Home Projects..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!name.trim()}
              style={{ opacity: name.trim() ? 1 : 0.5 }}
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewBoardModal
