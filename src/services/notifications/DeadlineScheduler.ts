import { useTaskStore } from '@/store/taskSlice'

class DeadlineScheduler {
  private timers: Map<string, number> = new Map()

  init() {
    this.rescheduleAll()
    
    // Reschedule on tab focus to ensure accuracy
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.rescheduleAll()
      }
    })
  }

  rescheduleAll() {
    // Clear all existing timers
    this.timers.forEach((id) => window.clearTimeout(id))
    this.timers.clear()

    const { tasks } = useTaskStore.getState()
    const now = Date.now()

    tasks.forEach((task) => {
      if (task.dueDate && task.status !== 'done') {
        const timeUntilDue = task.dueDate - now

        if (timeUntilDue > 0) {
          // Schedule notification at due time
          const timerId = window.setTimeout(() => {
            this.notify(task.title, 'Task is due now!')
          }, timeUntilDue)
          this.timers.set(`${task.id}-due`, timerId)

          // Schedule 24h warning
          const oneDayMs = 24 * 60 * 60 * 1000
          const timeUntilWarning = timeUntilDue - oneDayMs
          if (timeUntilWarning > 0) {
            const warningTimerId = window.setTimeout(() => {
              this.notify(task.title, 'Task is due in 24 hours')
            }, timeUntilWarning)
            this.timers.set(`${task.id}-warning`, warningTimerId)
          }
        }
      }
    })
  }

  private async notify(title: string, body: string) {
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      new Notification(`SliceTask: ${title}`, { body })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification(`SliceTask: ${title}`, { body })
      }
    }
  }
}

export const deadlineScheduler = new DeadlineScheduler()
