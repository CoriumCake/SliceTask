import { Plus } from 'lucide-react'
import './Kanban.css'

interface AddCardButtonProps {
  onClick: () => void
}

const AddCardButton = ({ onClick }: AddCardButtonProps) => {
  return (
    <button className="add-card-button" onClick={onClick} aria-label="Add new task card">
      <Plus size={16} aria-hidden="true" />
      <span>Add Card</span>
    </button>
  )
}

export default AddCardButton
