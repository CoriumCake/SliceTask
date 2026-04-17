import { useState, useEffect } from 'react'
import { Shield, Check, XCircle } from 'lucide-react'
import './Modals.css'

const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const isAgreed = localStorage.getItem('slicetask_privacy_agreed')
    if (!isAgreed) {
      setIsOpen(true)
    }
  }, [])

  const handleAgree = () => {
    localStorage.setItem('slicetask_privacy_agreed', 'true')
    setIsOpen(false)
  }

  const handleDisagree = () => {
    // Keep displaying the policy or provide feedback
    alert('You must agree to the Privacy Policy to use SliceTask.')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="settings-modal" style={{ maxWidth: '560px', padding: 'var(--spacing-xl)', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <Shield size={32} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '24px' }}>Privacy & Data Policy</h2>
        </div>

        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto', 
          padding: 'var(--spacing-md)', 
          backgroundColor: 'var(--bg-elevated)', 
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          marginBottom: 'var(--spacing-xl)',
          border: '1px solid var(--border-subtle)'
        }}>
          <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)', fontWeight: 600 }}>
            SliceTask is a local-first, privacy-respecting application.
          </p>
          
          <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginTop: 'var(--spacing-md)' }}>1. Data Storage</h3>
          <p>All your tasks, history, and settings are stored locally in your browser's IndexedDB. We do not have a central server, and we do not store your data.</p>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginTop: 'var(--spacing-md)' }}>2. AI Integration (BYOK)</h3>
          <p>SliceTask uses a "Bring Your Own Key" model. Your API keys (Gemini/Groq) are stored locally in your browser. They are only sent directly to the respective AI providers to process your requests.</p>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginTop: 'var(--spacing-md)' }}>3. Google Drive Sync</h3>
          <p>If you enable Google Drive sync, your data is uploaded to a hidden "appDataFolder" in your own Google Drive. SliceTask cannot access any other files in your Drive.</p>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginTop: 'var(--spacing-md)' }}>4. No Tracking</h3>
          <p>We do not use cookies, analytics, or any form of user tracking. Your usage of this app is entirely private.</p>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '16px', marginTop: 'var(--spacing-md)' }}>5. Browser Data</h3>
          <p>Clearing your browser cache or site data will permanently delete your local tasks and settings unless you have backed them up via Google Drive or JSON export.</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-md)', width: '100%' }}>
          <button
            onClick={handleDisagree}
            style={{ 
              flex: 1, 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-subtle)', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <XCircle size={18} />
            <span>I Disagree</span>
          </button>
          <button
            onClick={handleAgree}
            style={{
              flex: 2,
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Check size={18} />
            <span>I Agree & Continue</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
