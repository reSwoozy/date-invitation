import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { getSafeAreaInsets } from '../utils/safeArea'

interface RunawayNoButtonProps {
  className?: string
}

const PADDING = 12
const HOVER_COOLDOWN_MS = 280
const PROXIMITY_RADIUS = 72
const PROXIMITY_LOCK_MS = 550
const MIN_JUMP_PX = 110
const MIN_FROM_POINTER_PX = 85
const FIRST_MIN_JUMP_PX = 28
const FIRST_MAX_JUMP_PX = 56
const MAX_PICK_ATTEMPTS = 18

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function randomFleeTarget(
  rect: DOMRect,
  pointerX: number,
  pointerY: number,
  soft = false,
): { left: number; top: number } {
  const safe = getSafeAreaInsets()
  const minLeft = PADDING + safe.left
  const minTop = PADDING + safe.top
  const maxLeft = window.innerWidth - rect.width - PADDING - safe.right
  const maxTop = window.innerHeight - rect.height - PADDING - safe.bottom
  const curCx = rect.left + rect.width / 2
  const curCy = rect.top + rect.height / 2
  const minJump = soft ? FIRST_MIN_JUMP_PX : MIN_JUMP_PX
  const maxJump = soft ? FIRST_MAX_JUMP_PX : Infinity

  for (let i = 0; i < MAX_PICK_ATTEMPTS; i++) {
    const left = minLeft + Math.random() * Math.max(0, maxLeft - minLeft)
    const top = minTop + Math.random() * Math.max(0, maxTop - minTop)
    const newCx = left + rect.width / 2
    const newCy = top + rect.height / 2
    const jump = Math.hypot(newCx - curCx, newCy - curCy)

    if (jump < minJump) continue
    if (soft && jump > maxJump) continue
    if (Math.hypot(newCx - pointerX, newCy - pointerY) < MIN_FROM_POINTER_PX) {
      continue
    }

    return { left, top }
  }

  if (soft) {
    const angle = Math.random() * Math.PI * 2
    const dist =
      FIRST_MIN_JUMP_PX + Math.random() * (FIRST_MAX_JUMP_PX - FIRST_MIN_JUMP_PX)
    return {
      left: clamp(rect.left + Math.cos(angle) * dist, minLeft, maxLeft),
      top: clamp(rect.top + Math.sin(angle) * dist, minTop, maxTop),
    }
  }

  const centerLeft = (minLeft + maxLeft) / 2 - rect.width / 2
  const centerTop = (minTop + maxTop) / 2 - rect.height / 2
  return {
    left: clamp(centerLeft, minLeft, maxLeft),
    top: clamp(centerTop, minTop, maxTop),
  }
}

export function RunawayNoButton({ className = '' }: RunawayNoButtonProps) {
  const { t } = useTranslation()
  const btnRef = useRef<HTMLButtonElement>(null)
  const lastFlee = useRef(0)
  const proximityLockedUntil = useRef(0)
  const isFreeRef = useRef(false)
  const pendingFirstTarget = useRef<{ left: number; top: number } | null>(null)

  const [isFree, setIsFree] = useState(false)
  const [slotSize, setSlotSize] = useState<{ width: number; height: number } | null>(
    null,
  )
  const [coords, setCoords] = useState({ left: 0, top: 0 })
  const [animateMove, setAnimateMove] = useState(false)

  const applyCoords = useCallback((left: number, top: number, withTransition: boolean) => {
    setAnimateMove(withTransition)
    setCoords({ left, top })
  }, [])

  const flee = useCallback(
    (pointerX: number, pointerY: number, urgent = false) => {
      const now = Date.now()
      if (!urgent && now - lastFlee.current < HOVER_COOLDOWN_MS) return
      lastFlee.current = now

      const el = btnRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const target = randomFleeTarget(rect, pointerX, pointerY, !isFreeRef.current)

      if (!isFreeRef.current) {
        isFreeRef.current = true
        pendingFirstTarget.current = target
        setSlotSize({ width: rect.width, height: rect.height })
        setIsFree(true)
        setAnimateMove(false)
        setCoords({ left: rect.left, top: rect.top })
        proximityLockedUntil.current = now + PROXIMITY_LOCK_MS
        return
      }

      applyCoords(target.left, target.top, true)
    },
    [applyCoords],
  )

  useLayoutEffect(() => {
    if (!isFree || !pendingFirstTarget.current) return

    const target = pendingFirstTarget.current
    pendingFirstTarget.current = null

    requestAnimationFrame(() => {
      applyCoords(target.left, target.top, true)
    })
  }, [isFree, applyCoords])

  useEffect(() => {
    if (!isFree) return

    const onPointerMove = (e: PointerEvent) => {
      if (Date.now() < proximityLockedUntil.current) return

      const el = btnRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)

      if (dist < PROXIMITY_RADIUS) {
        flee(e.clientX, e.clientY, false)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [isFree, flee])

  return (
    <>
      {slotSize && (
        <span
          className="runaway-slot"
          style={{ width: slotSize.width, height: slotSize.height }}
          aria-hidden="true"
        />
      )}
      <button
        ref={btnRef}
        type="button"
        className={`btn btn-no runaway-no ${isFree ? 'runaway-no--free' : ''} ${className}`}
        style={
          isFree
            ? {
                position: 'fixed',
                left: coords.left,
                top: coords.top,
                zIndex: 100,
                margin: 0,
              }
            : undefined
        }
        data-animate={animateMove ? 'true' : 'false'}
        onPointerEnter={(e) => flee(e.clientX, e.clientY)}
        onPointerDown={(e) => {
          e.preventDefault()
          flee(e.clientX, e.clientY, true)
        }}
      >
        {t('ask.no')}
      </button>
    </>
  )
}
