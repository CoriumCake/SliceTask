import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AIService } from '@/services/ai/AIService'
import { db } from '@/services/db/database'
import { notifyOtherTabs } from '@/services/db/tabSync'
import { useTaskStore } from './taskSlice'
import { useToastStore } from './toastStore'
import { useUIStore } from './uiSlice'
import type { PromptHistoryEntry } from '@/types'

export type AIProvider = 'gemini' | 'groq'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIState {
  provider: AIProvider
  apiKey: string
  isLoading: boolean
  error: string | null
  history: PromptHistoryEntry[]
  context: Message[]
  setProvider: (provider: AIProvider) => void
  setApiKey: (key: string) => void
  clearApiKey: () => void
  setError: (error: string | null) => void
  fetchHistory: () => Promise<void>
  submitPrompt: (prompt: string) => Promise<void>
  archiveCurrentBoard: (name?: string | null, skipToast?: boolean) => Promise<void>
  loadHistoryEntry: (id: string) => Promise<void>
  clearHistory: () => Promise<void>
  deleteHistoryEntries: (ids: string[]) => Promise<void>
  clearContext: () => void
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      provider: 'gemini',
      apiKey: '',
      isLoading: false,
      error: null,
      history: [],
      context: [],
      setProvider: (provider) => set({ provider }),
      setApiKey: (apiKey) => set({ apiKey, error: null }),
      clearApiKey: () => set({ apiKey: '', error: null }),
      setError: (error) => set({ error }),
      clearContext: () => set({ context: [] }),

      fetchHistory: async () => {
        try {
          const history = await db.promptHistory.orderBy('createdAt').reverse().toArray()
          set({ history })
        } catch (error) {
          set({ error: (error as Error).message })
        }
      },

      archiveCurrentBoard: async (name, skipToast = false) => {
        const { tasks, resetData } = useTaskStore.getState()
        const { currentBoardName, activeHistoryId, setActiveHistoryId, setCurrentBoardName } = useUIStore.getState()
        const { addToast } = useToastStore.getState()
        
        if (tasks.length === 0) {
          if (!skipToast) addToast('Cannot archive an empty board', 'warning')
          return
        }

        try {
          let boardName = name || currentBoardName
          
          if (!boardName) {
            // Try to name it after the first task or fall back to date
            const firstTaskTitle = tasks[0]?.title
            boardName = firstTaskTitle 
              ? (firstTaskTitle.length > 40 ? firstTaskTitle.substring(0, 37) + '...' : firstTaskTitle)
              : `Archived Board (${new Date().toLocaleDateString()})`
          }

          if (activeHistoryId) {
            // Update existing entry instead of creating new one
            console.log('Updating existing history entry:', activeHistoryId)
            const existingEntry = get().history.find(h => h.id === activeHistoryId)
            if (existingEntry) {
              const updatedEntry: PromptHistoryEntry = {
                ...existingEntry,
                name: boardName,
                response: JSON.stringify(tasks),
                generatedTaskIds: tasks.map(t => t.id),
              }
              await db.promptHistory.put(updatedEntry)
              
              set((state) => ({
                history: state.history.map(h => h.id === activeHistoryId ? updatedEntry : h)
              }))
            }
          } else {
            // Create new entry
            const promptId = crypto.randomUUID()
            const historyEntry: PromptHistoryEntry = {
              id: promptId,
              name: boardName,
              prompt: `Archived Board: ${boardName}`,
              provider: get().provider,
              response: JSON.stringify(tasks),
              generatedTaskIds: tasks.map(t => t.id),
              createdAt: Date.now(),
            }

            console.log('Creating new history entry:', boardName)
            await db.promptHistory.add(historyEntry)
            set((state) => ({ 
              history: [historyEntry, ...state.history]
            }))
          }

          await resetData() // Clear active board
          setCurrentBoardName(null)
          setActiveHistoryId(null)
          set({ context: [] }) // Start fresh with AI
          
          if (!skipToast) addToast('Board archived to history', 'success')
          notifyOtherTabs()
        } catch (error) {
          console.error('Failed to archive board:', error)
          if (!skipToast) addToast(`Failed to archive: ${(error as Error).message}`, 'error')
        }
      },

      submitPrompt: async (prompt) => {
        const { provider, apiKey, context } = get()
        const { addToast } = useToastStore.getState()

        if (!apiKey) {
          const msg = 'Please set your API key in settings'
          set({ error: msg })
          addToast(msg, 'warning')
          return
        }

        set({ isLoading: true, error: null })
        try {
          // Pass full context to AIService for multi-turn conversations
          const suggestions = await AIService.getTasks(provider, prompt, apiKey, context)
          
          if (suggestions.length === 0) {
            throw new Error('AI returned no tasks. Try a more specific goal.')
          }

          const promptId = crypto.randomUUID()
          const { bulkAddTasks } = useTaskStore.getState()
          
          const newTasks = suggestions.map(s => ({
            id: crypto.randomUUID(),
            title: s.title,
            description: s.description,
            priority: s.priority,
            status: 'todo' as const,
            dueDate: null,
            sourcePromptId: promptId,
          }))

          await bulkAddTasks(newTasks)
          addToast(`Successfully generated ${newTasks.length} tasks`, 'success')

          const boardSummary = prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt
          const { currentBoardName, setCurrentBoardName } = useUIStore.getState()
          
          if (!currentBoardName) {
            setCurrentBoardName(boardSummary)
          }

          const historyEntry: PromptHistoryEntry = {
            id: promptId,
            name: boardSummary,
            prompt,
            provider,
            response: JSON.stringify(suggestions),
            generatedTaskIds: newTasks.map(t => (t as any).id),
            createdAt: Date.now(),
          }
          await db.promptHistory.add(historyEntry)
          
          // Update context (keep last 5 pairs = 10 messages)
          const newContext: Message[] = [
            ...context,
            { role: 'user' as const, content: prompt },
            { role: 'assistant' as const, content: JSON.stringify(suggestions) }
          ].slice(-10)

          set((state) => ({ 
            history: [historyEntry, ...state.history],
            context: newContext,
            isLoading: false 
          }))
          notifyOtherTabs()
        } catch (error) {
          const errorMessage = (error as Error).message
          set({ error: errorMessage, isLoading: false })
          addToast(errorMessage, 'error')
        }
      },

      loadHistoryEntry: async (id) => {
        const entry = get().history.find(h => h.id === id)
        if (!entry) {
          console.error('History entry not found:', id)
          return
        }

        const { tasks, bulkAddTasks, resetData } = useTaskStore.getState()
        const { currentBoardName, setCurrentBoardName, setActivePanel, setActiveHistoryId } = useUIStore.getState()
        const { addToast } = useToastStore.getState()

        try {
          console.log('Loading history entry:', entry.name, 'ID:', id)
          // Save current board if not empty
          if (tasks.length > 0) {
            console.log('Current board not empty, archiving first...')
            await get().archiveCurrentBoard(currentBoardName, true)
          } else {
            await resetData()
          }

          const items = JSON.parse(entry.response)
          const { restoreTasks } = useTaskStore.getState()
          
          // Determine if this is an archived board (full task data) or AI response (suggestions)
          const isArchivedBoard = items.length > 0 && 'status' in items[0]

          if (isArchivedBoard) {
            console.log('Restoring archived board with full data')
            const tasksWithNewIds = items.map((t: any) => ({
              ...t,
              id: crypto.randomUUID(),
              sourcePromptId: entry.id
            }))
            await restoreTasks(tasksWithNewIds)
          } else {
            console.log('Restoring AI suggestions')
            const newTasks = items.map((item: any) => ({
              id: crypto.randomUUID(),
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: 'todo' as const,
              dueDate: null,
              sourcePromptId: entry.id,
            }))
            await bulkAddTasks(newTasks)
          }

          setCurrentBoardName(entry.name)
          setActiveHistoryId(entry.id)
          setActivePanel('board')
        } catch (error) {
          console.error('Failed to load history entry:', error)
          addToast(`Failed to load: ${(error as Error).message}`, 'error')
        }
      },

      clearHistory: async () => {
        try {
          const { activeHistoryId, setActiveHistoryId, setCurrentBoardName } = useUIStore.getState()
          const { resetData } = useTaskStore.getState()
          
          await db.promptHistory.clear()
          set({ history: [] })
          
          // If we had a board loaded from history, clear it
          if (activeHistoryId) {
            await resetData()
            setCurrentBoardName(null)
            setActiveHistoryId(null)
          }
          
          notifyOtherTabs()
        } catch (error) {
          set({ error: (error as Error).message })
        }
      },

      deleteHistoryEntries: async (ids) => {
        try {
          const { activeHistoryId, setActiveHistoryId, setCurrentBoardName } = useUIStore.getState()
          const { resetData } = useTaskStore.getState()

          await db.promptHistory.bulkDelete(ids)
          set((state) => ({
            history: state.history.filter(h => !ids.includes(h.id))
          }))

          // If the active board is being deleted, reset the current board
          if (activeHistoryId && ids.includes(activeHistoryId)) {
            await resetData()
            setCurrentBoardName(null)
            setActiveHistoryId(null)
          }

          notifyOtherTabs()
        } catch (error) {
          set({ error: (error as Error).message })
        }
      }
    }),
    {
      name: 'slicetask-ai-storage',
      partialize: (state) => ({
        provider: state.provider,
        apiKey: state.apiKey,
      }),
    }
  )
)
