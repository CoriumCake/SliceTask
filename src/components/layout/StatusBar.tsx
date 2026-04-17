import { RefreshCw, Timer, CloudOff, AlertCircle } from 'lucide-react'
import { usePomodoroStore } from '@/store/pomodoroSlice'
import { useSyncStore } from '@/store/syncSlice'
import { useTaskStore } from '@/store/taskSlice'

const StatusBar = () => {
  const { timeRemaining, state, isRunning } = usePomodoroStore()
  const { isAuthenticated, isSyncing, error: syncError } = useSyncStore()
  const { tasks } = useTaskStore()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000
  
  const tasksDueToday = tasks.filter(t => 
    t.status !== 'done' && 
    t.dueDate && 
    t.dueDate >= todayStart && 
    t.dueDate < todayEnd
  ).length

  return (
    <footer className="status-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
          {!isAuthenticated ? (
            <>
              <CloudOff size={14} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Local Only</span>
            </>
          ) : syncError ? (
            <>
              <AlertCircle size={14} color="var(--accent-danger)" />
              <span style={{ color: 'var(--accent-danger)' }}>Sync Error</span>
            </>
          ) : (
            <>
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} color="var(--accent-success)" />
              <span>{isSyncing ? 'Syncing...' : 'Synced'}</span>
            </>
          )}
        </div>
        
        {(isRunning || state !== 'idle') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <Timer size={14} color={state.includes('Break') ? 'var(--accent-success)' : 'var(--accent-primary)'} />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
      
      {tasksDueToday > 0 && (
        <div style={{ color: tasksDueToday > 0 ? 'var(--accent-warning)' : 'inherit' }}>
          {tasksDueToday} task{tasksDueToday === 1 ? '' : 's'} due today
        </div>
      )}
    </footer>
  )
}

export default StatusBar
