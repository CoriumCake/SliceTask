import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ 
          padding: 'var(--spacing-xl)', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 'var(--spacing-md)',
          height: '100%',
          justifyContent: 'center'
        }}>
          <h2 style={{ color: 'var(--accent-danger)' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Try refreshing the page or clearing your data in Settings.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              backgroundColor: 'var(--accent-primary)', 
              color: 'white', 
              padding: 'var(--spacing-sm) var(--spacing-md)', 
              borderRadius: 'var(--radius-md)' 
            }}
          >
            Refresh App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
