import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  activePanel: 'board' | 'history' | 'pomodoro' | 'settings'
  selectedTaskId: string | null
  mobileActiveTab: 'todo' | 'inProgress' | 'done'
  palette: string[]
  currentBoardName: string | null
  activeHistoryId: string | null
  toggleTheme: () => void
  toggleSidebar: () => void
  setActivePanel: (panel: UIState['activePanel']) => void
  selectTask: (id: string | null) => void
  setMobileActiveTab: (tab: UIState['mobileActiveTab']) => void
  updatePaletteColor: (index: number, color: string) => void
  addPaletteColor: (color: string) => void
  setCurrentBoardName: (name: string | null) => void
  setActiveHistoryId: (id: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      activePanel: 'board',
      selectedTaskId: null,
      mobileActiveTab: 'todo',
      palette: ['#7c66f5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
      currentBoardName: null,
      activeHistoryId: null,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      setActivePanel: (panel) => set({ activePanel: panel }),
      selectTask: (id) => set({ selectedTaskId: id }),
      setMobileActiveTab: (mobileActiveTab) => set({ mobileActiveTab }),
      updatePaletteColor: (index, color) => set((state) => {
        const newPalette = [...state.palette]
        newPalette[index] = color
        return { palette: newPalette }
      }),
      addPaletteColor: (color) => set((state) => ({
        palette: [...state.palette, color]
      })),
      setCurrentBoardName: (currentBoardName) => set({ currentBoardName }),
      setActiveHistoryId: (activeHistoryId) => set({ activeHistoryId }),
    }),
    {
      name: 'slicetask-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        palette: state.palette,
        currentBoardName: state.currentBoardName,
        activeHistoryId: state.activeHistoryId,
      }),
    }
  )
)
