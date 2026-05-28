export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

let cached: SafeAreaInsets | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('orientationchange', () => {
    cached = null
  })
}

/** Read iOS/Android safe-area insets (notch, home bar). */
export function getSafeAreaInsets(): SafeAreaInsets {
  if (cached) return cached

  if (typeof document === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const probe = document.createElement('div')
  probe.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'padding-top:env(safe-area-inset-top,0px)',
    'padding-right:env(safe-area-inset-right,0px)',
    'padding-bottom:env(safe-area-inset-bottom,0px)',
    'padding-left:env(safe-area-inset-left,0px)',
    'visibility:hidden',
    'pointer-events:none',
  ].join(';')
  document.documentElement.appendChild(probe)
  const style = getComputedStyle(probe)
  cached = {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  }
  probe.remove()
  return cached
}
