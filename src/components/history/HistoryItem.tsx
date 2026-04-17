import { useRef } from 'react'
import { useAIStore } from '@/store/aiSlice'
import { Check } from 'lucide-react'
import './History.css'

interface HistoryItemProps {
  name: string
  date: string
  tasksCount: number
  id: string
  isSelected: boolean
  isSelectionMode: boolean
  onSelect: (id: string) => void
  onLongPress: (id: string) => void
}

const HistoryItem = ({ 
  name, 
  date, 
  tasksCount, 
  id, 
  isSelected, 
  isSelectionMode, 
  onSelect, 
  onLongPress 
}: HistoryItemProps) => {
  const loadHistoryEntry = useAIStore((state) => state.loadHistoryEntry)
  const timerRef = useRef<number | null>(null)
  const longPressTriggered = useRef(false)

  const handleStart = () => {
    if (isSelectionMode) return
    longPressTriggered.current = false
    timerRef.current = window.setTimeout(() => {
      onLongPress(id)
      longPressTriggered.current = true
      timerRef.current = null
    }, 500)
  }

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    if (isSelectionMode) {
      onSelect(id)
    } else {
      loadHistoryEntry(id)
    }
  }

  return (
    <div 
      className={`history-item ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''}`}
      onClick={handleClick}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {isSelectionMode && (
        <div className="selection-indicator">
          {isSelected ? (
            <div className="check-circle selected">
              <Check size={12} color="white" strokeWidth={3} />
            </div>
          ) : (
            <div className="check-circle" />
          )}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
        <p className="history-item-prompt" style={{ flex: 1, fontWeight: 600 }}>{name}</p>
      </div>
      <div className="history-item-meta">
        <span>{date}</span>
        <span>{tasksCount} tasks</span>
      </div>
    </div>
  )
}

export default HistoryItem
