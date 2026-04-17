import { useState } from 'react'
import Sidebar from './Sidebar'
import StatusBar from './StatusBar'
import KanbanBoard from '../kanban/KanbanBoard'
import AIInputBar from '../ai/AIInputBar'
import TaskDetailPanel from '../task-detail/TaskDetailPanel'
import HistoryPanel from '../history/HistoryPanel'
import PomodoroWidget from '../pomodoro/PomodoroWidget'
import SettingsModal from '../modals/SettingsModal'
import OnboardingModal from '../modals/OnboardingModal'
import ConflictModal from '../modals/ConflictModal'
import ToastContainer from '../ui/ToastContainer'
import { ErrorBoundary } from '../ui/ErrorBoundary'
import { useUIStore } from '@/store/uiSlice'
import { useSyncStore } from '@/store/syncSlice'
import { syncCoordinator } from '@/services/drive/SyncCoordinator'
import { LayoutDashboard, History, Timer, Settings } from 'lucide-react'
import './Layout.css'
import './MobileNav.css'

const Layout = () => {
  const { activePanel, setActivePanel, currentBoardName, setCurrentBoardName } = useUIStore()
  const { conflict } = useSyncStore()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')

  const handleNameDoubleClick = () => {
    if (activePanel === 'board') {
      setEditNameValue(currentBoardName || 'Board')
      setIsEditingName(true)
    }
  }

  const handleNameSubmit = () => {
    if (editNameValue.trim()) {
      setCurrentBoardName(editNameValue.trim())
    }
    setIsEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSubmit()
    if (e.key === 'Escape') setIsEditingName(false)
  }

  const navItems = [
    { id: 'board', icon: LayoutDashboard, label: currentBoardName || 'Board' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'pomodoro', icon: Timer, label: 'Pomodoro' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const

  const renderContent = () => {
    switch (activePanel) {
      case 'board':
        return <KanbanBoard />
      case 'history':
        return <HistoryPanel />
      case 'pomodoro':
        return <PomodoroWidget />
      default:
        return <p style={{ color: 'var(--text-secondary)' }}>Content for {activePanel} will be implemented soon.</p>
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {isEditingName ? (
            <input
              autoFocus
              className="modal-input"
              style={{ fontSize: '24px', fontWeight: 'bold', padding: '4px 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--accent-primary)', borderRadius: 0, width: '100%', outline: 'none' }}
              value={editNameValue}
              onChange={(e) => setEditNameValue(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
            />
          ) : (
            <h1 
              style={{ textTransform: 'capitalize', fontSize: '24px', cursor: activePanel === 'board' ? 'pointer' : 'default' }}
              onDoubleClick={handleNameDoubleClick}
              title={activePanel === 'board' ? 'Double-click to rename' : undefined}
            >
              {activePanel === 'board' ? (currentBoardName || 'Board') : activePanel}
            </h1>
          )}
          {activePanel === 'board' && <AIInputBar />}
        </header>
        <div style={{ flex: 1, overflowY: activePanel === 'board' ? 'hidden' : 'auto' }}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>
      <ErrorBoundary>
        <TaskDetailPanel />
      </ErrorBoundary>
      <SettingsModal />
      <OnboardingModal />
      {conflict && (
        <ConflictModal
          localDate={conflict.localDate}
          cloudDate={conflict.cloudDate}
          localTasks={conflict.localTasks}
          cloudTasks={conflict.cloudTasks}
          onResolve={(source) => syncCoordinator.resolveConflict(source)}
        />
      )}
      <ToastContainer />
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePanel === item.id
          return (
            <button
              key={item.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePanel(item.id)}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
      <StatusBar />
    </div>
  )
}

export default Layout
