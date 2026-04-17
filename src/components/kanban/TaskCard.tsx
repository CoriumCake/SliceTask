import { Calendar, Trash2 } from 'lucide-react'
import './Kanban.css'

interface TaskCardProps {
  title: string
  priority?: 'low' | 'medium' | 'high'
  color?: string | null
  dueDate?: number | null
  pomodoroCount?: number
  onDelete?: (e: React.MouseEvent) => void
}

const TaskCard = ({ title, priority, color, dueDate, pomodoroCount, onDelete }: TaskCardProps) => {
  const now = Date.now()
  const isOverdue = dueDate && dueDate < now
  const isApproaching = dueDate && !isOverdue && dueDate - now < 86400000 // 24 hours

  const statusClass = isOverdue ? 'overdue' : isApproaching ? 'approaching' : ''
  const ariaLabel = `Task: ${title}${priority ? `, ${priority} priority` : ''}${isOverdue ? ', overdue' : isApproaching ? ', due soon' : ''}${pomodoroCount ? `, ${pomodoroCount} pomodoros completed` : ''}`

  return (
    <div className={`task-card ${statusClass}`} role="article" aria-label={ariaLabel}>
      {color && <div className="task-card-color-strip" style={{ backgroundColor: color }} aria-hidden="true" />}
      
      {onDelete && (
        <button 
          className="task-card-delete"
          onClick={onDelete}
          aria-label="Delete task"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      )}

      <h3 className="task-card-title">{title}</h3>
      <div className="task-card-footer">
        {priority && <div className={`priority-dot priority-${priority}`} title={`${priority} priority`} aria-label={`${priority} priority`} />}
        {dueDate && (
          <div className={`deadline-badge ${statusClass}`} aria-label={`Due date: ${new Date(dueDate).toLocaleDateString()}`}>
            <Calendar size={12} aria-hidden="true" />
            <span>{new Date(dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {pomodoroCount !== undefined && pomodoroCount > 0 && (
          <div title="Pomodoro sessions completed" aria-label={`${pomodoroCount} pomodoro sessions completed`}>
            <span aria-hidden="true">🍅</span> {pomodoroCount}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard
