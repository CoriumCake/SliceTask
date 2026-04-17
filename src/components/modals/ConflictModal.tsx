import { AlertTriangle, Cloud, HardDrive } from 'lucide-react'
import './Modals.css'

interface ConflictModalProps {
  localDate: number
  cloudDate: number
  localTasks: number
  cloudTasks: number
  onResolve: (source: 'local' | 'cloud') => void
}

const ConflictModal = ({ localDate, cloudDate, localTasks, cloudTasks, onResolve }: ConflictModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="settings-modal" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <AlertTriangle color="var(--accent-warning)" size={20} />
            <h2 style={{ fontSize: '18px' }}>Sync Conflict Detected</h2>
          </div>
        </div>
        
        <div className="modal-body" style={{ gap: 'var(--spacing-xl)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            The data on your Google Drive is different from your local storage. 
            Which one would you like to keep?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div 
              style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}
            >
              <HardDrive size={32} style={{ marginBottom: 'var(--spacing-sm)' }} />
              <h3 style={{ fontSize: '14px', marginBottom: 'var(--spacing-xs)' }}>Local Data</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(localDate).toLocaleString()}<br />
                {localTasks} tasks
              </p>
              <button 
                onClick={() => onResolve('local')}
                style={{ marginTop: 'var(--spacing-md)', width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 600 }}
              >
                Use Local
              </button>
            </div>

            <div 
              style={{ padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}
            >
              <Cloud size={32} style={{ marginBottom: 'var(--spacing-sm)' }} />
              <h3 style={{ fontSize: '14px', marginBottom: 'var(--spacing-xs)' }}>Cloud Data</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(cloudDate).toLocaleString()}<br />
                {cloudTasks} tasks
              </p>
              <button 
                onClick={() => onResolve('cloud')}
                style={{ marginTop: 'var(--spacing-md)', width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-primary)', color: 'white', fontWeight: 600 }}
              >
                Use Cloud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
