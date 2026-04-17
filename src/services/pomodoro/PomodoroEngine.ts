import { usePomodoroStore } from '@/store/pomodoroSlice'

class PomodoroEngine {
  private worker: Worker | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./timer.worker.ts', import.meta.url), {
        type: 'module',
      })
      
      this.worker.onmessage = (e) => {
        if (e.data === 'tick') {
          usePomodoroStore.getState().tick()
        }
      }
    }
  }

  start() {
    this.worker?.postMessage('start')
  }

  stop() {
    this.worker?.postMessage('stop')
  }
}

export const pomodoroEngine = new PomodoroEngine()
