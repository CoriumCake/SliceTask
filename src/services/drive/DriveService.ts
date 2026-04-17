const BACKUP_FILENAME = 'slicetask-backup.json'

export class DriveService {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async findBackupFile(): Promise<string | null> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${BACKUP_FILENAME}'&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )
    const data = await response.json()
    return data.files?.[0]?.id || null
  }

  async uploadBackup(state: any, fileId?: string): Promise<string> {
    const metadata = {
      name: BACKUP_FILENAME,
      parents: fileId ? undefined : ['appDataFolder'],
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', new Blob([JSON.stringify(state)], { type: 'application/json' }))

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'

    const response = await fetch(url, {
      method: fileId ? 'PATCH' : 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}` },
      body: form,
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'Failed to upload backup')
    return data.id
  }

  async downloadBackup(fileId: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    )
    if (!response.ok) throw new Error('Failed to download backup')
    return response.json()
  }
}
