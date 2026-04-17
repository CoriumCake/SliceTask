import { useState } from 'react'
import { useUIStore } from '@/store/uiSlice'
import { useTaskStore } from '@/store/taskSlice'
import { X, Trash2, Calendar, Flag, Plus, Check } from 'lucide-react'
import './TaskDetail.css'

const TaskDetailPanel = () => {
  const { selectedTaskId, selectTask, palette, addPaletteColor, updatePaletteColor } = useUIStore()
  const { tasks, updateTask, deleteTask } = useTaskStore()
  
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customColor, setCustomColor] = useState('#7c66f5')
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null)

  const task = tasks.find((t) => t.id === selectedTaskId)

  if (!task && selectedTaskId) return null

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (task) updateTask(task.id, { title: e.target.value })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (task) updateTask(task.id, { description: e.target.value })
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (task) updateTask(task.id, { status: e.target.value as any })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (task) updateTask(task.id, { priority: (e.target.value === 'none' ? null : e.target.value) as any })
  }

  const handleColorSelect = (color: string) => {
    if (task) updateTask(task.id, { color })
  }

  const handleAddCustomColor = () => {
    if (replacingIndex !== null) {
      updatePaletteColor(replacingIndex, customColor)
      setReplacingIndex(null)
    } else {
      addPaletteColor(customColor)
    }
    if (task) updateTask(task.id, { color: customColor })
    setShowColorPicker(false)
  }

  const handleDelete = async () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id)
      selectTask(null)
    }
  }

  return (
    <div 
      className={`task-detail-panel ${selectedTaskId ? 'open' : ''}`}
      role="complementary"
      aria-label="Task details"
      aria-hidden={!selectedTaskId}
    >
      {task && (
        <>
          <div className="task-detail-header">
            <button 
              onClick={() => {
                selectTask(null)
                setShowColorPicker(false)
              }}
              aria-label="Close panel"
            >
              <X size={24} aria-hidden="true" />
            </button>
            <button 
              onClick={handleDelete} 
              style={{ color: 'var(--accent-danger)' }}
              aria-label="Delete task"
            >
              <Trash2 size={20} aria-hidden="true" />
            </button>
          </div>

          <div className="task-detail-section">
            <input
              className="task-detail-title-input"
              placeholder="Task title"
              value={task.title}
              onChange={handleTitleChange}
              aria-label="Task title"
            />
          </div>

          <div className="task-detail-section">
            <label className="task-detail-label" id="color-label">Color Label</label>
            <div className="color-palette" role="group" aria-labelledby="color-label">
              <button 
                className={`color-swatch ${!task.color ? 'active' : ''}`}
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleColorSelect('')}
                title="No color"
                aria-label="No color"
                aria-pressed={!task.color}
              />
              {palette.map((color, index) => (
                <button
                  key={index}
                  className={`color-swatch ${task.color === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    setReplacingIndex(index)
                    setCustomColor(color)
                    setShowColorPicker(true)
                  }}
                  title="Right-click to replace"
                  aria-label={`Color ${index + 1}`}
                  aria-pressed={task.color === color}
                />
              ))}
              <button 
                className="add-color-btn" 
                onClick={() => {
                  setReplacingIndex(null)
                  setShowColorPicker(!showColorPicker)
                }}
                aria-label="Add custom color"
                aria-expanded={showColorPicker}
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>

            {showColorPicker && (
              <div className="color-picker-popover" role="dialog" aria-label="Custom color picker">
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {replacingIndex !== null ? `Replacing slot ${replacingIndex + 1}` : 'Add to palette'}
                </p>
                <div className="hex-input-group">
                  <input 
                    type="color" 
                    value={customColor} 
                    onChange={(e) => setCustomColor(e.target.value)} 
                    aria-label="Color hex"
                  />
                  <input 
                    type="text" 
                    value={customColor} 
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#HEX"
                    aria-label="Hex code"
                  />
                  <button 
                    onClick={handleAddCustomColor} 
                    style={{ color: 'var(--accent-success)' }}
                    aria-label="Confirm color"
                  >
                    <Check size={20} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div className="task-detail-section" style={{ flex: 1 }}>
              <label className="task-detail-label" htmlFor="task-status">Status</label>
              <select id="task-status" value={task.status} onChange={handleStatusChange}>
                <option value="todo">Todo</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="task-detail-section" style={{ flex: 1 }}>
              <label className="task-detail-label" htmlFor="task-priority">Priority</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                <Flag size={16} aria-hidden="true" />
                <select id="task-priority" value={task.priority || 'none'} onChange={handlePriorityChange}>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="task-detail-section">
            <label className="task-detail-label" htmlFor="task-due-date">Due Date</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
              <Calendar size={16} aria-hidden="true" />
              <input
                id="task-due-date"
                type="date"
                value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value ? new Date(e.target.value).getTime() : null })}
              />
            </div>
          </div>

          <div className="task-detail-section">
            <label className="task-detail-label">Pomodoro Sessions</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '14px' }}>
              <span aria-label={`${task.pomodoroCount || 0} sessions completed`}>
                <span aria-hidden="true">🍅</span> {task.pomodoroCount || 0} sessions completed
              </span>
            </div>
          </div>

          <div className="task-detail-section" style={{ flex: 1 }}>
            <label className="task-detail-label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="task-detail-description"
              placeholder="Add a detailed description..."
              value={task.description}
              onChange={handleDescriptionChange}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default TaskDetailPanel
