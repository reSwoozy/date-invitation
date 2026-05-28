import { fetchSettings } from '../firebase'
import type { AppSettings } from '../types'

let cached: AppSettings | null | undefined
let inflight: Promise<AppSettings | null> | null = null

/** Single shared Firestore read for settings/main (deduped across the app). */
export function getSettingsOnce(): Promise<AppSettings | null> {
  if (cached !== undefined) return Promise.resolve(cached)
  if (!inflight) {
    inflight = fetchSettings()
      .then((data) => {
        cached = data
        return data
      })
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}

export function peekSettings(): AppSettings | null | undefined {
  return cached
}

export function invalidateSettingsCache(): void {
  cached = undefined
  inflight = null
}
