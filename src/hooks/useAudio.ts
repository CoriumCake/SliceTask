import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '@/store/pomodoroSlice'

export const useAudio = () => {
  const { state, isRunning, settings } = usePomodoroStore()
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Handle transition sounds
  const playTransitionSound = () => {
    if (!settings.soundEnabled) return
    const sound = new Audio(`/audio/${settings.soundEnabled ? 'bell.mp3' : ''}`) // Simplified
    sound.play().catch(() => {}) // Catch autoplay blocks
  }

  // Effect for state transitions
  const prevState = useRef(state)
  useEffect(() => {
    if (prevState.current !== state && state !== 'idle') {
      playTransitionSound()
    }
    prevState.current = state
  }, [state])

  // Handle ambient music
  useEffect(() => {
    if (settings.ambientMusicEnabled && isRunning && state === 'work') {
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio(`/audio/${settings.ambientMusicType}.mp3`)
        ambientAudioRef.current.loop = true
      }
      ambientAudioRef.current.play().catch(() => {})
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause()
        ambientAudioRef.current = null
      }
    }

    return () => {
      ambientAudioRef.current?.pause()
    }
  }, [settings.ambientMusicEnabled, settings.ambientMusicType, isRunning, state])
}
