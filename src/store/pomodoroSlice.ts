import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/services/db/database'
import { useTaskStore } from './taskSlice'

export type PomodoroState = 'idle' | 'work' | 'shortBreak' | 'longBreak'

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
  ambientMusicEnabled: boolean
  ambientMusicType: 'rain' | 'lofi' | 'whitenoise' | 'none'
}

interface PomodoroStore {
  state: PomodoroState
  timeRemaining: number
  sessionsCompleted: number
  totalSessionsToday: number
  settings: PomodoroSettings
  isRunning: boolean
  linkedTaskId: string | null
  
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => Promise<void>
  skip: () => void
  setLinkedTask: (id: string | null) => void
  updateSettings: (partial: Partial<PomodoroSettings>) => void
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartWork: false,
  soundEnabled: true,
  ambientMusicEnabled: false,
  ambientMusicType: 'none',
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      state: 'idle',
      timeRemaining: DEFAULT_SETTINGS.workDuration,
      sessionsCompleted: 0,
      totalSessionsToday: 0,
      settings: DEFAULT_SETTINGS,
      isRunning: false,
      linkedTaskId: null,

      start: () => {
        const { state } = get()
        if (state === 'idle') {
          set({ state: 'work', isRunning: true })
        } else {
          set({ isRunning: true })
        }
      },
      pause: () => set({ isRunning: false }),
      reset: () => {
        const { state, settings } = get()
        let time = settings.workDuration
        if (state === 'shortBreak') time = settings.shortBreakDuration
        if (state === 'longBreak') time = settings.longBreakDuration
        set({ timeRemaining: time, isRunning: false })
      },

      tick: async () => {
        const { timeRemaining, isRunning, state, settings, sessionsCompleted, totalSessionsToday, linkedTaskId } = get()
        if (!isRunning) return

        if (timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 })
        } else {
          // Timer finished
          const now = Date.now()
          const today = new Date().toISOString().split('T')[0]

          if (state === 'work') {
            // Save session
            await db.pomodoroSessions.add({
              id: crypto.randomUUID(),
              taskId: linkedTaskId,
              type: 'work',
              duration: settings.workDuration,
              actualDuration: settings.workDuration,
              completedAt: now,
              date: today,
            })

            // Increment task count if linked
            if (linkedTaskId) {
              const { tasks, updateTask } = useTaskStore.getState()
              const task = tasks.find(t => t.id === linkedTaskId)
              if (task) {
                await updateTask(linkedTaskId, { pomodoroCount: (task.pomodoroCount || 0) + 1 })
              }
            }
          }

          let nextState: PomodoroState = 'idle'
          let nextTime = 0
          let newSessionsCompleted = sessionsCompleted
          let newTotalSessionsToday = totalSessionsToday

          if (state === 'work') {
            newSessionsCompleted += 1
            newTotalSessionsToday += 1
            if (newSessionsCompleted >= settings.sessionsBeforeLongBreak) {
              nextState = 'longBreak'
              nextTime = settings.longBreakDuration
              newSessionsCompleted = 0
            } else {
              nextState = 'shortBreak'
              nextTime = settings.shortBreakDuration
            }
          } else {
            nextState = 'work'
            nextTime = settings.workDuration
          }

          set({
            state: nextState,
            timeRemaining: nextTime,
            isRunning: (nextState === 'work' ? settings.autoStartWork : settings.autoStartBreaks),
            sessionsCompleted: newSessionsCompleted,
            totalSessionsToday: newTotalSessionsToday,
          })
        }
      },

      skip: () => {
        const { state, settings, sessionsCompleted } = get()
        let nextState: PomodoroState = 'idle'
        let nextTime = 0
        let newSessionsCompleted = sessionsCompleted

        if (state === 'work' || state === 'idle') {
          newSessionsCompleted += 1
          if (newSessionsCompleted >= settings.sessionsBeforeLongBreak) {
            nextState = 'longBreak'
            nextTime = settings.longBreakDuration
            newSessionsCompleted = 0
          } else {
            nextState = 'shortBreak'
            nextTime = settings.shortBreakDuration
          }
        } else {
          nextState = 'work'
          nextTime = settings.workDuration
        }

        set({
          state: nextState,
          timeRemaining: nextTime,
          isRunning: false,
          sessionsCompleted: newSessionsCompleted,
        })
      },

      setLinkedTask: (id) => set({ linkedTaskId: id }),
      updateSettings: (partial) => set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'slicetask-pomodoro-storage',
      partialize: (state) => ({
        settings: state.settings,
        sessionsCompleted: state.sessionsCompleted,
        totalSessionsToday: state.totalSessionsToday,
      }),
    }
  )
)
