import { create } from 'zustand'
import type { Task } from '@/types'
import { db } from '@/services/db/database'
import { notifyOtherTabs } from '@/services/db/tabSync'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'columnOrder' | 'pomodoroCount' | 'completedAt'>) => Promise<void>
  updateTask: (id: string, partial: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, newStatus: Task['status'], newOrder: number) => Promise<void>
  bulkAddTasks: (tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'columnOrder' | 'pomodoroCount' | 'completedAt'>[]) => Promise<void>
  restoreTasks: (tasks: Task[]) => Promise<void>
  resetData: () => Promise<void>
}

const validateTask = (task: Partial<Task>) => {
  if (task.title !== undefined) {
    if (!task.title.trim()) throw new Error('Task title cannot be empty')
    if (task.title.length > 200) throw new Error('Task title must be under 200 characters')
  }
  if (task.description !== undefined) {
    if (task.description.length > 5000) throw new Error('Description must be under 5000 characters')
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true })
    try {
      const tasks = await db.tasks.toArray()
      set({ tasks: tasks.sort((a, b) => a.columnOrder - b.columnOrder), isLoading: false })
    } catch (error) {
      set({ error: `Failed to load tasks: ${(error as Error).message}`, isLoading: false })
    }
  },

  addTask: async (taskData) => {
    try {
      validateTask(taskData)
      const now = Date.now()
      const tasksInColumn = get().tasks.filter((t) => t.status === taskData.status)
      const newOrder = tasksInColumn.length

      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        columnOrder: newOrder,
        pomodoroCount: 0,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      }

      await db.tasks.add(newTask)
      set((state) => ({ tasks: [...state.tasks, newTask] }))
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateTask: async (id, partial) => {
    try {
      validateTask(partial)
      const now = Date.now()
      const update = { ...partial, updatedAt: now }
      if (partial.status === 'done' && !get().tasks.find(t => t.id === id)?.completedAt) {
        update.completedAt = now
      }

      await db.tasks.update(id, update)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...update } : t)),
      }))
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteTask: async (id) => {
    try {
      await db.tasks.delete(id)
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }))
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  moveTask: async (id, newStatus, newOrder) => {
    try {
      const now = Date.now()
      const task = get().tasks.find((t) => t.id === id)
      if (!task) return

      const update: Partial<Task> = {
        status: newStatus,
        columnOrder: newOrder,
        updatedAt: now,
      }

      if (newStatus === 'done' && !task.completedAt) {
        update.completedAt = now
      } else if (newStatus !== 'done') {
        update.completedAt = null
      }

      await db.tasks.update(id, update)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...update } : t)),
      }))
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  bulkAddTasks: async (taskDatas) => {
    try {
      const now = Date.now()
      const newTasks: Task[] = taskDatas.map((data, index) => {
        validateTask(data)
        return {
          ...data,
          id: crypto.randomUUID(),
          columnOrder: index,
          pomodoroCount: 0,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
        }
      })

      await db.tasks.bulkAdd(newTasks)
      set((state) => ({ tasks: [...state.tasks, ...newTasks] }))
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  restoreTasks: async (tasks) => {
    try {
      await db.tasks.bulkAdd(tasks)
      set((state) => ({ tasks: [...state.tasks, ...tasks] }))
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  resetData: async () => {
    try {
      await db.tasks.clear()
      set({ tasks: [] })
      notifyOtherTabs()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  }
}))
