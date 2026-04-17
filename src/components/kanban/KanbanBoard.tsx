import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTaskStore } from '@/store/taskSlice'
import { useUIStore } from '@/store/uiSlice'
import { useAIStore } from '@/store/aiSlice'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import type { Task } from '@/types'
import { Plus, LayoutDashboard } from 'lucide-react'
import NewBoardModal from '../modals/NewBoardModal'
import './Kanban.css'

const KanbanBoard = () => {
  const { tasks, moveTask } = useTaskStore()
  const { mobileActiveTab, setMobileActiveTab, currentBoardName, setCurrentBoardName } = useUIStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<Task['priority'] | 'all'>('all')
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const columns = [
    { id: 'todo', title: 'Todo' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ] as const

  const getTasksByStatus = (status: Task['status']) =>
    tasks
      .filter((t) => t.status === status)
      .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
      .sort((a, b) => a.columnOrder - b.columnOrder)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    // Handling dropping over another task
    if (activeTask && overTask && activeTask.status !== overTask.status) {
      moveTask(activeId, overTask.status, overTask.columnOrder)
    }
    
    // Handling dropping over a column
    const isOverAColumn = columns.some(c => c.id === overId)
    if (activeTask && isOverAColumn && activeTask.status !== overId) {
      moveTask(activeId, overId as Task['status'], getTasksByStatus(overId as Task['status']).length)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = tasks.find((t) => t.id === activeId)
    const overTask = tasks.find((t) => t.id === overId)

    if (activeTask && overTask && activeTask.status === overTask.status) {
      // Intra-column reorder
      const columnTasks = getTasksByStatus(activeTask.status)
      const newIndex = columnTasks.findIndex((t) => t.id === overId)
      
      moveTask(activeId, activeTask.status, newIndex)
    }
  }

  const handleCreateBoard = async (name: string) => {
    const { archiveCurrentBoard } = useAIStore.getState()
    if (tasks.length > 0) {
      await archiveCurrentBoard(currentBoardName, true)
    }
    setCurrentBoardName(name)
    setShowNewBoardModal(false)
  }

  // If no board is active and no tasks exist, show big + button
  if (!currentBoardName && tasks.length === 0) {
    return (
      <div className="empty-board-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 'calc(100vh - 200px)',
        gap: 'var(--spacing-lg)'
      }}>
        {showNewBoardModal && (
          <NewBoardModal
            title="Create New Board"
            description="Give your new project a name to get started."
            onConfirm={handleCreateBoard}
            onCancel={() => setShowNewBoardModal(false)}
          />
        )}
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: 'var(--radius-lg)', 
          backgroundColor: 'var(--bg-elevated)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent-primary)',
          border: '1px solid var(--border-subtle)'
        }}>
          <LayoutDashboard size={40} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: 'var(--spacing-xs)' }}>No active board</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create a new board to start organizing your tasks.</p>
        </div>
        <button 
          onClick={() => setShowNewBoardModal(true)}
          className="btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-md) var(--spacing-xl)',
            fontSize: '16px'
          }}
        >
          <Plus size={20} />
          <span>New Board</span>
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="mobile-tabs" style={{ marginBottom: 0 }}>
              {columns.map(col => (
                <button 
                  key={col.id} 
                  className={`mobile-tab-btn ${mobileActiveTab === col.id ? 'active' : ''}`}
                  onClick={() => setMobileActiveTab(col.id)}
                >
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          <div className="priority-filters" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Filter:</span>
            {(['all', 'high', 'medium', 'low'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`priority-filter-btn ${priorityFilter === p ? 'active' : ''} ${p !== 'all' ? `priority-${p}` : ''}`}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  textTransform: 'capitalize',
                  backgroundColor: priorityFilter === p ? 'var(--bg-elevated)' : 'transparent',
                  color: priorityFilter === p ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="kanban-board" style={{ flex: 1, minHeight: 0 }}>
          {columns.map((column) => (
            <div key={column.id} className={`kanban-column-wrapper ${mobileActiveTab === column.id ? 'mobile-visible' : ''}`}>
              <SortableContext
                items={getTasksByStatus(column.id).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  tasks={getTasksByStatus(column.id)}
                />
              </SortableContext>
            </div>
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTask ? (
          <TaskCard
            title={activeTask.title}
            priority={activeTask.priority || undefined}
            color={activeTask.color}
            dueDate={activeTask.dueDate}
            pomodoroCount={activeTask.pomodoroCount}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard
