import { useState } from 'react'
import { usePomodoroStore } from '@/store/pomodoroSlice'
import { useTaskStore } from '@/store/taskSlice'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Flame, 
  Settings, 
  X,
  Volume2,
  Zap,
  Music
} from 'lucide-react'
import '../modals/Modals.css' // Reuse the compact settings styles
import './Pomodoro.css'

const PomodoroWidget = () => {
  const {
    state,
    timeRemaining,
    isRunning,
    sessionsCompleted,
    totalSessionsToday,
    settings,
    linkedTaskId,
    start,
    pause,
    reset,
    skip,
    setLinkedTask,
    updateSettings
  } = usePomodoroStore()

  const [showSettings, setShowSettings] = useState(false)
  const { tasks } = useTaskStore()
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress')

  const size = 240
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  
  const duration = state === 'work' || state === 'idle' 
    ? settings.workDuration 
    : state === 'shortBreak' 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration
      
  const progress = timeRemaining / duration
  const offset = circumference * (1 - progress)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getLabel = () => {
    switch (state) {
      case 'work': return 'Focus Session'
      case 'shortBreak': return 'Short Break'
      case 'longBreak': return 'Long Break'
      default: return 'Ready?'
    }
  }

  return (
    <div className="pomodoro-widget">
      <div style={{ alignSelf: 'flex-end', marginBottom: '-24px', zIndex: 10 }}>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          style={{ 
            color: showSettings ? 'var(--accent-primary)' : 'var(--text-secondary)',
            padding: '8px',
            margin: '-8px'
          }}
        >
          {showSettings ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {showSettings ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', padding: 'var(--spacing-md) 0' }}>
          <div className="settings-group">
            <h3 className="settings-group-title">Durations (min)</h3>
            <div className="settings-grid">
              <div className="settings-control">
                <label className="settings-compact-label">Work</label>
                <input 
                  type="number" 
                  value={settings.workDuration / 60} 
                  onChange={(e) => updateSettings({ workDuration: Number(e.target.value) * 60 })}
                  style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                />
              </div>
              <div className="settings-control">
                <label className="settings-compact-label">Short</label>
                <input 
                  type="number" 
                  value={settings.shortBreakDuration / 60} 
                  onChange={(e) => updateSettings({ shortBreakDuration: Number(e.target.value) * 60 })}
                  style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                />
              </div>
              <div className="settings-control">
                <label className="settings-compact-label">Long</label>
                <input 
                  type="number" 
                  value={settings.longBreakDuration / 60} 
                  onChange={(e) => updateSettings({ longBreakDuration: Number(e.target.value) * 60 })}
                  style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                />
              </div>
              <div className="settings-control">
                <label className="settings-compact-label">Interval</label>
                <input 
                  type="number" 
                  value={settings.sessionsBeforeLongBreak} 
                  onChange={(e) => updateSettings({ sessionsBeforeLongBreak: Number(e.target.value) })}
                  style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                />
              </div>
            </div>
          </div>

          <div className="settings-group">
            <h3 className="settings-group-title">Sound & Automation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <label className="settings-option-btn">
                <input 
                  type="checkbox" 
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                />
                <Volume2 size={16} />
                <span>Sound</span>
              </label>
              <label className="settings-option-btn">
                <input 
                  type="checkbox" 
                  checked={settings.autoStartBreaks}
                  onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                />
                <Zap size={16} />
                <span>Auto Break</span>
              </label>
              
              <div style={{ marginTop: 'var(--spacing-xs)' }}>
                <label className="settings-option-btn" style={{ borderBottomLeftRadius: settings.ambientMusicEnabled ? 0 : 'var(--radius-md)', borderBottomRightRadius: settings.ambientMusicEnabled ? 0 : 'var(--radius-md)' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.ambientMusicEnabled}
                    onChange={(e) => updateSettings({ ambientMusicEnabled: e.target.checked })}
                  />
                  <Music size={16} />
                  <span>Ambient Music</span>
                </label>
                {settings.ambientMusicEnabled && (
                  <div style={{ 
                    padding: 'var(--spacing-sm)', 
                    backgroundColor: 'var(--bg-base)', 
                    border: '1px solid var(--border-subtle)',
                    borderTop: 'none',
                    borderBottomLeftRadius: 'var(--radius-md)',
                    borderBottomRightRadius: 'var(--radius-md)'
                  }}>
                    <select 
                      className="settings-select-compact"
                      value={settings.ambientMusicType}
                      onChange={(e) => updateSettings({ ambientMusicType: e.target.value as any })}
                    >
                      <option value="rain">Rain</option>
                      <option value="lofi">Lo-Fi Beats</option>
                      <option value="whitenoise">White Noise</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="timer-circle">
            <svg width={size} height={size} className="timer-svg">
              <circle
                className="timer-background"
                cx={size / 2}
                cy={size / 2}
                r={radius}
              />
              <circle
                className="timer-progress"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ stroke: state.includes('Break') ? 'var(--accent-success)' : 'var(--accent-primary)' }}
              />
            </svg>
            <div className="timer-text">{formatTime(timeRemaining)}</div>
          </div>

          <div className="pomodoro-controls">
            <button className="control-button" title="Reset" onClick={reset}>
              <RotateCcw size={20} />
            </button>
            <button 
              className="control-button primary" 
              title={isRunning ? 'Pause' : 'Start'}
              onClick={isRunning ? pause : start}
            >
              {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="control-button" title="Skip" onClick={skip}>
              <SkipForward size={20} />
            </button>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', width: '100%' }}>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>{getLabel()}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Session {sessionsCompleted + 1} of {settings.sessionsBeforeLongBreak}
                </p>
                {totalSessionsToday >= 3 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#ff4500' }}>
                    <Flame size={14} fill="#ff4500" />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>{totalSessionsToday}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="task-selector" style={{ marginTop: 'var(--spacing-md)' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Working on
              </label>
              <select 
                value={linkedTaskId || ''} 
                onChange={(e) => setLinkedTask(e.target.value || null)}
                style={{ width: '100%', fontSize: '13px' }}
              >
                <option value="">No task linked</option>
                {inProgressTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PomodoroWidget
