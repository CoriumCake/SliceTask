let timerId: number | null = null
let expected: number = 0

self.onmessage = (e: MessageEvent) => {
  if (e.data === 'start') {
    if (timerId) return
    expected = Date.now() + 1000
    timerId = self.setTimeout(step, 1000)
  } else if (e.data === 'stop') {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }
}

function step() {
  const dt = Date.now() - expected
  if (dt > 1000) {
    // Drastic drift, maybe the system was suspended
  }
  
  self.postMessage('tick')
  
  expected += 1000
  timerId = self.setTimeout(step, Math.max(0, 1000 - dt))
}
