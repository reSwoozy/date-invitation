import type confetti from 'canvas-confetti'

type ConfettiFn = typeof confetti

let confettiPromise: Promise<ConfettiFn> | null = null

export function loadConfetti(): Promise<ConfettiFn> {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then((m) => m.default)
  }
  return confettiPromise
}
