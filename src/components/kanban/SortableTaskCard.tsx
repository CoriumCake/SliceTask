import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from './TaskCard'

interface SortableTaskCardProps {
  id: string
  title: string
  priority?: 'low' | 'medium' | 'high' | null
  color?: string | null
  dueDate?: number | null
  pomodoroCount?: number
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}

const SortableTaskCard = ({ id, title, priority, color, dueDate, pomodoroCount, onClick, onDelete }: SortableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
      <TaskCard
        title={title}
        priority={priority || undefined}
        color={color}
        dueDate={dueDate}
        pomodoroCount={pomodoroCount}
        onDelete={onDelete}
      />
    </div>
  )
}

export default SortableTaskCard
