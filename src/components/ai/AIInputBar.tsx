import { useRef, useEffect, useState } from 'react'
import { Sparkles, ArrowUp, Loader2, RefreshCcw } from 'lucide-react'
import { useAIStore } from '@/store/aiSlice'
import './AIInputBar.css'

const AIInputBar = () => {
  const [value, setValue] = useState('')
  const { provider, isLoading, submitPrompt, context, clearContext } = useAIStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
    handleInput()
  }, [value])

  const handleSubmit = async () => {
    if (value.trim() && !isLoading) {
      const prompt = value.trim()
      setValue('')
      await submitPrompt(prompt)
    }
  }

  return (
    <div className={`ai-input-bar ${isLoading ? 'submitting' : ''}`}>
      <div className="ai-provider-badge" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} />
          <span style={{ textTransform: 'capitalize' }}>
            {provider} {provider === 'gemini' ? '2.0 Flash' : 'Llama 3.3'}
          </span>
        </div>
        {context.length > 0 && (
          <button 
            onClick={clearContext}
            style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Start a new session"
          >
            <RefreshCcw size={10} />
            <span>New Session</span>
          </button>
        )}
      </div>
      <div className="ai-input-container">
        <textarea
          ref={textareaRef}
          className="ai-textarea"
          rows={1}
          placeholder={context.length > 0 ? "Follow up..." : "Break down a goal..."}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <button 
          className="ai-submit-button" 
          disabled={!value.trim() || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
        </button>
      </div>
      {isLoading && <div className="ai-progress-bar" />}
    </div>
  )
}

export default AIInputBar
