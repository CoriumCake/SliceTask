import Dexie, { type Table } from 'dexie'
import type { Task, PromptHistoryEntry, PomodoroSession, SyncMetaEntry } from '@/types'

export class SliceTaskDB extends Dexie {
  tasks!: Table<Task, string>
  promptHistory!: Table<PromptHistoryEntry, string>
  pomodoroSessions!: Table<PomodoroSession, string>
  syncMeta!: Table<SyncMetaEntry, string>

  constructor() {
    super('SliceTaskDB')
    this.version(1).stores({
      tasks: 'id, status, dueDate, createdAt, columnOrder',
      promptHistory: 'id, createdAt',
      pomodoroSessions: 'id, date, taskId',
      syncMeta: 'key',
    })
  }
}

export const db = new SliceTaskDB()

// Seed data function for development
export async function seedDatabase() {
  // No-op: prevent placeholder tasks from being created
}
