/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaskStore } from './taskSlice'
import { db } from '@/services/db/database'

// Mock IndexedDB
vi.mock('@/services/db/database', () => ({
  db: {
    tasks: {
      toArray: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      bulkAdd: vi.fn(),
      clear: vi.fn(),
    },
  },
}))

describe('taskSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset Zustand state
    act(() => {
      useTaskStore.setState({ tasks: [], isLoading: false, error: null })
    })
  })

  it('should initialize with empty tasks', () => {
    const { result } = renderHook(() => useTaskStore())
    expect(result.current.tasks).toEqual([])
  })

  it('should add a task', async () => {
    const { result } = renderHook(() => useTaskStore())
    const newTask = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: null,
      sourcePromptId: null,
    }

    await act(async () => {
      await result.current.addTask(newTask)
    })

    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test Task')
    expect(db.tasks.add).toHaveBeenCalled()
  })

  it('should validate task title', async () => {
    const { result } = renderHook(() => useTaskStore())
    
    await expect(
      act(async () => {
        await result.current.addTask({
          title: '',
          description: '',
          status: 'todo',
          priority: null,
          dueDate: null,
          sourcePromptId: null,
        })
      })
    ).rejects.toThrow('Task title cannot be empty')
  })

  it('should update a task', async () => {
    const { result } = renderHook(() => useTaskStore())
    
    const id = '123'
    act(() => {
      useTaskStore.setState({
        tasks: [{
          id,
          title: 'Old Title',
          description: '',
          status: 'todo',
          priority: null,
          dueDate: null,
          columnOrder: 0,
          pomodoroCount: 0,
          sourcePromptId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          completedAt: null
        }]
      })
    })

    await act(async () => {
      await result.current.updateTask(id, { title: 'New Title' })
    })

    expect(result.current.tasks[0].title).toBe('New Title')
    expect(db.tasks.update).toHaveBeenCalledWith(id, expect.objectContaining({ title: 'New Title' }))
  })
})
