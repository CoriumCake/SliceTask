import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Task } from '@/types'
import SortableTaskCard from './SortableTaskCard'
import AddCardButton from './AddCardButton'
import { useUIStore } from '@/store/uiSlice'
import { useTaskStore } from '@/store/taskSlice'
import { useAIStore } from '@/store/aiSlice'
import './Kanban.css'

interface KanbanColumnProps {
  id: Task['status']
  title: string
  tasks: Task[]
}

const KanbanColumn = ({ id, title, tasks }: KanbanColumnProps) => {
  const selectTask = useUIStore((state) => state.selectTask)
  const addTask = useTaskStore((state) => state.addTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const isAILoading = useAIStore((state) => state.isLoading)
  const { setNodeRef } = useDroppable({ id })
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleAdd = async () => {
    if (newTitle.trim()) {
      await addTask({
        title: newTitle.trim(),
        description: '',
        status: id,
        priority: null,
        dueDate: null,
        sourcePromptId: null,
      })
    }
    setNewTitle('')
    setIsAdding(false)
  }

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="kanban-column-header">
        <h2 className="kanban-column-title">
          {title}
          <span className="kanban-column-count">{tasks.length}</span>
        </h2>
      </div>
      <div className="task-list">
        {tasks.map((task) => (
          <SortableTaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            priority={task.priority}
            color={task.color}
            dueDate={task.dueDate}
            pomodoroCount={task.pomodoroCount}
            onClick={() => selectTask(task.id)}
            onDelete={(e) => {
              e.stopPropagation()
              if (id === 'todo') {
                deleteTask(task.id)
              } else {
                if (window.confirm('Delete this task?')) deleteTask(task.id)
              }
            }}
          />
        ))}
        {id === 'todo' && isAILoading && (
          <>
            <div className="task-card skeleton">
              <div className="skeleton-title" />
              <div className="skeleton-meta" />
            </div>
            <div className="task-card skeleton" style={{ animationDelay: '0.1s' }}>
              <div className="skeleton-title" />
              <div className="skeleton-meta" />
            </div>
            <div className="task-card skeleton" style={{ animationDelay: '0.2s' }}>
              <div className="skeleton-title" />
              <div className="skeleton-meta" />
            </div>
          </>
        )}
        {isAdding ? (
          <div className="task-card">
            <input
              autoFocus
              className="task-card-title"
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: 0 }}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleAdd}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setIsAdding(false)
              }}
            />
          </div>
        ) : null}
      </div>
      <AddCardButton onClick={() => setIsAdding(true)} />
    </div>
  )
}

export default KanbanColumn
