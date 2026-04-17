import { useTaskStore } from '@/store/taskSlice'
import { useAIStore } from '@/store/aiSlice'
import { useSyncStore } from '@/store/syncSlice'
import { usePomodoroStore } from '@/store/pomodoroSlice'
import { useUIStore } from '@/store/uiSlice'
import { DriveService } from './DriveService'
import { db } from '../db/database'
import { validateBackup } from '@/utils/validators'

class SyncCoordinator {
  private syncTimeout: number | null = null
  private driveService: DriveService | null = null
  private channel = new BroadcastChannel('slicetask_sync_leader')
  private isLeader = false

  init() {
    this.setupLeaderElection()
    
    // Listen for state changes to trigger auto-sync
    useTaskStore.subscribe(() => this.scheduleSync())
    useAIStore.subscribe(() => this.scheduleSync())
    
    // When auth changes, initialize service
    useSyncStore.subscribe((state) => {
      if (state.accessToken) {
        this.driveService = new DriveService(state.accessToken)
        this.performInitialSync()
      } else {
        this.driveService = null
      }
    })
  }

  private setupLeaderElection() {
    // Simple leader election: first one to ping wins
    this.isLeader = true // Default for first tab
    this.channel.onmessage = (msg) => {
      if (msg.data.type === 'PING_LEADER') {
        this.channel.postMessage({ type: 'PONG_LEADER' })
      } else if (msg.data.type === 'PONG_LEADER') {
        this.isLeader = false
      }
    }
    this.channel.postMessage({ type: 'PING_LEADER' })
  }

  private scheduleSync() {
    if (!this.driveService || !this.isLeader) return

    if (this.syncTimeout) window.clearTimeout(this.syncTimeout)
    this.syncTimeout = window.setTimeout(() => this.performSync(), 5000) // 5s debounce
  }

  private async performSync() {
    if (!this.driveService) return
    
    const { setSyncing, setLastSync, setError } = useSyncStore.getState()
    setSyncing(true)

    try {
      const state = await this.serializeFullState()
      const fileId = await this.driveService.findBackupFile()
      await this.driveService.uploadBackup(state, fileId || undefined)
      setLastSync(Date.now())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSyncing(false)
    }
  }

  private async performInitialSync() {
    if (!this.driveService) return
    
    try {
      const fileId = await this.driveService.findBackupFile()
      if (fileId) {
        const cloudData = await this.driveService.downloadBackup(fileId)
        
        if (!validateBackup(cloudData)) {
          throw new Error('Cloud backup data is invalid or corrupted')
        }

        const localTasks = await db.tasks.toArray()
        
        // Simple heuristic: if cloud has more tasks or cloud is significantly newer
        // and local has more than just seed data, trigger conflict UI
        if (localTasks.length > 4) {
          const localMaxDate = Math.max(...localTasks.map(t => t.updatedAt), 0)
          if (cloudData.exportedAt > localMaxDate) {
            useSyncStore.getState().setConflict({
              localDate: localMaxDate,
              cloudDate: cloudData.exportedAt,
              localTasks: localTasks.length,
              cloudTasks: cloudData.tasks?.length || 0,
              cloudData
            })
            return
          }
        }
        
        // Default: just restore if cloud is available
        await this.restoreState(cloudData)
      }
    } catch (err) {
      console.error('Initial sync failed:', err)
      useSyncStore.getState().setError((err as Error).message)
    }
  }

  async resolveConflict(source: 'local' | 'cloud') {
    const { conflict, setConflict } = useSyncStore.getState()
    if (!conflict) return

    if (source === 'cloud') {
      await this.restoreState(conflict.cloudData)
    } else {
      // If local wins, we'll just push local on next auto-sync
      this.scheduleSync()
    }
    
    setConflict(null)
  }

  private async serializeFullState() {
    const tasks = await db.tasks.toArray()
    const history = await db.promptHistory.toArray()
    const sessions = await db.pomodoroSessions.toArray()
    
    return {
      version: 1,
      exportedAt: Date.now(),
      tasks,
      history,
      sessions,
      settings: {
        theme: useUIStore.getState().theme,
        pomodoro: usePomodoroStore.getState().settings
      }
    }
  }

  private async restoreState(data: any) {
    await db.tasks.clear()
    await db.promptHistory.clear()
    await db.pomodoroSessions.clear()
    
    if (data.tasks) await db.tasks.bulkAdd(data.tasks)
    if (data.history) await db.promptHistory.bulkAdd(data.history)
    if (data.sessions) await db.pomodoroSessions.bulkAdd(data.sessions)
    
    await useTaskStore.getState().fetchTasks()
    await useAIStore.getState().fetchHistory()
  }
}

// Global instance
export const syncCoordinator = new SyncCoordinator()
