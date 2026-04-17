import { useUIStore } from '@/store/uiSlice'
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  History as HistoryIcon,
  Timer,
  Settings as SettingsIcon,
} from 'lucide-react'

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, activePanel, setActivePanel, currentBoardName } = useUIStore()

  const navItems = [
    { id: 'board', icon: LayoutDashboard, label: currentBoardName || 'Board' },
    { id: 'history', icon: HistoryIcon, label: 'History' },
    { id: 'pomodoro', icon: Timer, label: 'Pomodoro' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ] as const

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`} role="complementary" aria-label="Main sidebar">
      <div className="sidebar-header" style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {sidebarOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <img src="/favicon.svg" alt="" style={{ width: '24px', height: '24px' }} aria-hidden="true" />
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '20px' }}>SliceTask</span>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: 'var(--spacing-sm)' }} aria-label="Main navigation">
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePanel === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActivePanel(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    width: '100%',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={20} aria-hidden="true" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
