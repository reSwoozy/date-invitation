import { useCallback } from 'react'
import {
  clearSessionVerified,
  getSessionGuestName,
  isSessionVerified,
  setSessionVerified,
} from '../auth/session'

export function useVerified() {
  const isVerified = isSessionVerified()
  const guestName = getSessionGuestName()

  const setVerified = useCallback((name: string) => {
    setSessionVerified(name)
  }, [])

  const clearVerified = useCallback(() => {
    clearSessionVerified()
  }, [])

  return { isVerified, guestName, setVerified, clearVerified }
}
