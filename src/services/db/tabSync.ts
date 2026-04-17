import { useTaskStore } from '@/store/taskSlice'
import { useAIStore } from '@/store/aiSlice'

const channel = new BroadcastChannel('slicetask_sync')

export const initTabSync = () => {
  channel.onmessage = (event) => {
    if (event.data.type === 'REFRESH_DATA') {
      useTaskStore.getState().fetchTasks()
      useAIStore.getState().fetchHistory()
    }
  }
}

export const notifyOtherTabs = () => {
  channel.postMessage({ type: 'REFRESH_DATA' })
}
