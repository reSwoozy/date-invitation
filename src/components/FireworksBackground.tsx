import { useEffect } from 'react'
import { loadConfetti } from '../utils/loadConfetti'

const COLORS = ['#ff6b9d', '#ff8fab', '#ffd166', '#fff', '#e84393', '#ffc2d1']

export function FireworksBackground() {
  useEffect(() => {
    let cancelled = false
    let interval: ReturnType<typeof setInterval> | undefined

    void loadConfetti().then((confetti) => {
      if (cancelled) return

      const duration = 60_000
      const end = Date.now() + duration

      const burst = () => {
        confetti({
          particleCount: 70,
          spread: 100,
          startVelocity: 38,
          ticks: 120,
          zIndex: 1,
          colors: COLORS,
          origin: {
            x: 0.1 + Math.random() * 0.8,
            y: 0.15 + Math.random() * 0.45,
          },
          scalar: 0.9,
        })
      }

      burst()
      interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval)
          return
        }
        burst()
      }, 900)
    })

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [])

  return <div className="fireworks-layer" aria-hidden="true" />
}
