import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSettingsOnce } from '../settings/cache'
import type { AppSettings } from '../types'

interface SettingsContextValue {
  settings: AppSettings | null
  loading: boolean
  error: string | null
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getSettingsOnce()
      .then((data) => {
        if (cancelled) return
        if (!data) setError('settings_missing')
        else setSettings(data)
      })
      .catch(() => {
        if (!cancelled) setError('settings_load_failed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ settings, loading, error }),
    [settings, loading, error],
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return ctx
}
