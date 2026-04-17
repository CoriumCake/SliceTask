import { useState } from 'react'
import { useAIStore } from '@/store/aiSlice'
import { Plus, Trash2 } from 'lucide-react'
import HistoryItem from './HistoryItem'
import './History.css'
import { useUIStore } from '@/store/uiSlice'
import { useTaskStore } from '@/store/taskSlice'
import NewBoardModal from '../modals/NewBoardModal'

const HistoryPanel = () => {
  const { history, clearHistory, deleteHistoryEntries } = useAIStore()
  const { setActivePanel, setCurrentBoardName } = useUIStore()
  const { tasks, resetData } = useTaskStore()
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const handleNewBoardClick = () => {
    setShowNewBoardModal(true)
  }

  const handleCreateConfirm = async (name: string) => {
    const { currentBoardName } = useUIStore.getState()
    const { archiveCurrentBoard } = useAIStore.getState()

    if (tasks.length > 0) {
      await archiveCurrentBoard(currentBoardName, true)
    } else {
      await resetData()
    }
    
    setCurrentBoardName(name)
    useAIStore.getState().clearContext()
    setShowNewBoardModal(false)
    setActivePanel('board')
  }

  const handleLongPress = (id: string) => {
    setIsSelectionMode(true)
    setSelectedIds([id])
  }

  const handleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (window.confirm(`Delete ${selectedIds.length} items?`)) {
      await deleteHistoryEntries(selectedIds)
      setSelectedIds([])
      setIsSelectionMode(false)
    }
  }

  const cancelSelection = () => {
    setSelectedIds([])
    setIsSelectionMode(false)
  }

  const handlePanelClick = (e: React.MouseEvent) => {
    // If clicking the panel background (not an item), exit selection mode
    if (isSelectionMode && e.target === e.currentTarget) {
      cancelSelection()
    }
  }

  return (
    <div className="history-panel" onClick={handlePanelClick} style={{ minHeight: '100%' }}>
      {showNewBoardModal && (
        <NewBoardModal 
          title="New Board"
          onConfirm={handleCreateConfirm} 
          onCancel={() => setShowNewBoardModal(false)} 
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          {isSelectionMode ? (
            <button onClick={cancelSelection} style={{ color: 'var(--accent-primary)', fontSize: '14px', fontWeight: 600 }}>
              Cancel
            </button>
          ) : (
            <>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>History</h3>
              <button 
                onClick={handleNewBoardClick}
                title="Start new board"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--accent-primary)',
                  borderRadius: 'var(--radius-full)',
                  width: '24px',
                  height: '24px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <Plus size={14} />
              </button>
            </>
          )}
        </div>
        {isSelectionMode ? (
          <button 
            onClick={handleDeleteSelected}
            style={{ 
              fontSize: '12px', 
              color: 'var(--accent-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Trash2 size={12} />
            <span>Delete ({selectedIds.length})</span>
          </button>
        ) : (
          history.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('Clear all history?')) clearHistory()
              }}
              style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={12} />
              <span>Clear All</span>
            </button>
          )
        )}
      </div>
      {history.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
          No history yet. Try breaking down a goal!
        </p>
      ) : (
        history.map((item) => {
          const items = JSON.parse(item.response)
          
          // If it's a full archived board, filter for todo + inProgress
          // If it's AI suggestions, they are all effectively 'todo'
          const tasksCount = items.length > 0 && 'status' in items[0]
            ? items.filter((t: any) => t.status === 'todo' || t.status === 'inProgress').length
            : items.length

          return (
            <HistoryItem
              key={item.id}
              id={item.id}
              name={item.name || item.prompt}
              date={new Date(item.createdAt).toLocaleDateString()}
              tasksCount={tasksCount}
              isSelected={selectedIds.includes(item.id)}
              isSelectionMode={isSelectionMode}
              onSelect={handleSelect}
              onLongPress={handleLongPress}
            />
          )
        })
      )}
    </div>
  )
}

export default HistoryPanel
