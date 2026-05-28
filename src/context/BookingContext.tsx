import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSessionGuestName } from '../auth/session'
import type { BookingData } from '../types'

interface BookingContextValue {
  booking: Partial<BookingData>
  setCity: (city: string) => void
  setDate: (date: string) => void
  setActivity: (activity: string) => void
  setGuestName: (name: string) => void
  isComplete: boolean
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [guestName, setGuestNameState] = useState(() => getSessionGuestName())
  const [city, setCityState] = useState('')
  const [date, setDateState] = useState('')
  const [activity, setActivityState] = useState('')

  const setCity = useCallback((c: string) => setCityState(c), [])
  const setDate = useCallback((d: string) => setDateState(d), [])
  const setActivity = useCallback((a: string) => setActivityState(a), [])
  const setGuestName = useCallback((n: string) => setGuestNameState(n), [])

  const isComplete = Boolean(city && date && activity)

  const booking = useMemo(
    () => ({
      guestName,
      city,
      date,
      activity,
    }),
    [guestName, city, date, activity],
  )

  const value = useMemo(
    () => ({
      booking,
      setCity,
      setDate,
      setActivity,
      setGuestName,
      isComplete,
    }),
    [booking, setCity, setDate, setActivity, setGuestName, isComplete],
  )

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
