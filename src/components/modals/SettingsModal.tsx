import { useState } from 'react'
import { useUIStore } from '@/store/uiSlice'
import { useAIStore, type AIProvider } from '@/store/aiSlice'
import { useSyncStore } from '@/store/syncSlice'
import { X, Moon, Sun, Key, Cloud, Check, AlertCircle, LogOut } from 'lucide-react'
import { AIService } from '@/services/ai/AIService'
import { requestAccessToken, revokeToken } from '@/services/drive/auth'
import './Modals.css'

import { exportData, importData } from '@/utils/dataTransfer'

const SettingsModal = () => {
  const { theme, toggleTheme, activePanel, setActivePanel } = useUIStore()
  const { provider, apiKey, setProvider, setApiKey, clearApiKey } = useAIStore()
  const { isAuthenticated, accessToken, signOut, lastSyncTimestamp, isClientReady } = useSyncStore()
  
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'sync' | 'pomodoro'>('general')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  if (activePanel !== 'settings') return null

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const tabs = [
    { id: 'general', icon: Sun, label: 'General' },
    { id: 'ai', icon: Key, label: 'AI Provider' },
    { id: 'sync', icon: Cloud, label: 'Cloud Sync' },
  ] as const

  const handleTestKey = async () => {
    if (!apiKey) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const isValid = await AIService.testKey(provider, apiKey)
      setTestResult(isValid ? 'success' : 'error')
    } catch (err) {
      setTestResult('error')
    } finally {
      setIsTesting(false)
    }
  }

  const handleConnectDrive = () => {
    requestAccessToken()
  }

  const handleDisconnectDrive = () => {
    if (accessToken) {
      revokeToken(accessToken)
    } else {
      signOut()
    }
  }

  return (
    <div className="modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button onClick={() => setActivePanel('board')}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  className={`modal-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          <div className="modal-body">
            {activeTab === 'general' && (
              <div className="settings-group">
                <h3 className="settings-group-title">Appearance</h3>
                <div className="settings-row">
                  <span>Theme</span>
                  <button
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-xs) var(--spacing-md)',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <span style={{ textTransform: 'capitalize', fontSize: '14px' }}>{theme}</span>
                  </button>
                </div>

                <h3 className="settings-group-title" style={{ marginTop: 'var(--spacing-md)' }}>Data</h3>
                <div className="settings-button-group">
                  <button onClick={exportData}>
                    Export JSON
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.json'
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          try {
                            await importData(file)
                            alert('Data imported successfully!')
                          } catch (err) {
                            alert(`Failed to import: ${(err as Error).message}`)
                          }
                        }
                      }
                      input.click()
                    }}
                  >
                    Import JSON
                  </button>
                </div>
                
                <div className="settings-danger-zone">
                  <button
                    className="settings-danger-btn"
                    onClick={() => {
                      if (window.confirm('CRITICAL: This will delete ALL tasks, history, and settings. Are you absolutely sure?')) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="settings-group">
                <h3 className="settings-group-title">AI Provider</h3>
                <div className="settings-control">
                  <label className="settings-compact-label">Provider</label>
                  <select 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value as AIProvider)}
                    style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq</option>
                  </select>
                </div>
                <div className="settings-control">
                  <label className="settings-compact-label">API Key</label>
                  <div className="settings-input-group">
                    <input
                      type="password"
                      placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'Groq'} key`}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      style={{ padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                    />
                    {apiKey && (
                      <button 
                        onClick={clearApiKey}
                        style={{ color: 'var(--accent-danger)', fontSize: '12px', padding: '0 var(--spacing-sm)' }}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="settings-row" style={{ marginTop: 'var(--spacing-sm)' }}>
                  <button
                    className="settings-action-btn"
                    onClick={handleTestKey}
                    disabled={!apiKey || isTesting}
                  >
                    {isTesting ? 'Testing...' : 'Test Key'}
                  </button>
                  <div style={{ flex: 1 }}>
                    {testResult === 'success' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-success)', fontSize: '13px' }}>
                        <Check size={14} />
                        <span>Valid</span>
                      </div>
                    )}
                    {testResult === 'error' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-danger)', fontSize: '13px' }}>
                        <AlertCircle size={14} />
                        <span>Invalid</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sync' && (
              <div className="settings-group">
                <h3 className="settings-group-title">Cloud Sync</h3>
                <p className="settings-hint">
                  Sync tasks via Google Drive hidden app data folder.
                </p>
                
                {!googleClientId && (
                  <div style={{ 
                    padding: 'var(--spacing-sm)', 
                    backgroundColor: 'hsla(38, 90%, 55%, 0.1)', 
                    border: '1px solid var(--accent-warning)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    color: 'var(--accent-warning)',
                    marginBottom: 'var(--spacing-sm)'
                  }}>
                    <AlertCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Google Client ID not configured.
                  </div>
                )}

                {isAuthenticated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)' }}>
                      <Check size={16} />
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>Connected</span>
                    </div>
                    {lastSyncTimestamp && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Last synced: {new Date(lastSyncTimestamp).toLocaleString()}
                      </p>
                    )}
                    <button
                      onClick={handleDisconnectDrive}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        padding: 'var(--spacing-xs) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectDrive}
                    disabled={!googleClientId || !isClientReady}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: (googleClientId && isClientReady) ? '#4285F4' : 'var(--bg-elevated)',
                      color: (googleClientId && isClientReady) ? 'white' : 'var(--text-muted)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600,
                      fontSize: '14px',
                      width: '100%',
                      opacity: (googleClientId && isClientReady) ? 1 : 0.7,
                      border: (googleClientId && isClientReady) ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <Cloud size={18} />
                    <span>
                      {!googleClientId 
                        ? 'Sync Unavailable' 
                        : !isClientReady 
                          ? 'Initializing...' 
                          : 'Connect Google Drive'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
