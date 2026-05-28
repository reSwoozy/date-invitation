import { namesMatch } from '../firebase'
import { getSettingsOnce } from '../settings/cache'
import { GUEST_NAME_KEY, VERIFIED_KEY } from '../types'

export function isSessionVerified(): boolean {
  return (
    sessionStorage.getItem(VERIFIED_KEY) === 'true' &&
    Boolean(sessionStorage.getItem(GUEST_NAME_KEY)?.trim())
  )
}

export function getSessionGuestName(): string {
  return sessionStorage.getItem(GUEST_NAME_KEY)?.trim() ?? ''
}

export function setSessionVerified(guestName: string): void {
  sessionStorage.setItem(VERIFIED_KEY, 'true')
  sessionStorage.setItem(GUEST_NAME_KEY, guestName.trim())
}

export function clearSessionVerified(): void {
  sessionStorage.removeItem(VERIFIED_KEY)
  sessionStorage.removeItem(GUEST_NAME_KEY)
}

export async function validateSessionWithFirestore(): Promise<boolean> {
  if (!isSessionVerified()) return false

  const guestName = getSessionGuestName()
  const settings = await getSettingsOnce()
  if (!settings?.expectedName || !namesMatch(guestName, settings.expectedName)) {
    clearSessionVerified()
    return false
  }
  return true
}
