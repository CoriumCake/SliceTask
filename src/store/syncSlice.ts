import { create } from 'zustand'

interface SyncState {
  accessToken: string | null
  isAuthenticated: boolean
  isSyncing: boolean
  isClientReady: boolean
  lastSyncTimestamp: number | null
  error: string | null
  conflict: {
    localDate: number
    cloudDate: number
    localTasks: number
    cloudTasks: number
    cloudData: any
  } | null
  setAccessToken: (token: string) => void
  setClientReady: (isReady: boolean) => void
  signOut: () => void
  setSyncing: (isSyncing: boolean) => void
  setLastSync: (timestamp: number) => void
  setError: (error: string | null) => void
  setConflict: (conflict: SyncState['conflict']) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isSyncing: false,
  isClientReady: false,
  lastSyncTimestamp: null,
  error: null,
  conflict: null,

  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: true, error: null }),
  setClientReady: (isClientReady) => set({ isClientReady }),
  signOut: () => set({ accessToken: null, isAuthenticated: false }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSync: (lastSyncTimestamp) => set({ lastSyncTimestamp }),
  setError: (error) => set({ error }),
  setConflict: (conflict) => set({ conflict }),
}))
