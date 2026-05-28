import type { AppSettings, CityOption, LocalizedOption } from '../types'

function parseLabels(record: Record<string, unknown>): Record<string, string> {
  const labels: Record<string, string> = {}
  const labelsRaw = record.labels
  if (labelsRaw && typeof labelsRaw === 'object') {
    for (const [key, value] of Object.entries(
      labelsRaw as Record<string, unknown>,
    )) {
      if (typeof value === 'string' && value.trim()) {
        labels[key] = value.trim()
      }
    }
  }
  return labels
}

function parseOptions(raw: unknown): LocalizedOption[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const id = String(record.id ?? '').trim()
      if (!id) return null

      const labels = parseLabels(record)
      if (Object.keys(labels).length === 0) return null
      return { id, labels }
    })
    .filter((o): o is LocalizedOption => o !== null)
}

function parseCities(
  raw: unknown,
  legacyActivities: LocalizedOption[],
): CityOption[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const id = String(record.id ?? '').trim()
      if (!id) return null

      const labels = parseLabels(record)
      if (Object.keys(labels).length === 0) return null

      let activities = parseOptions(record.activities)
      if (activities.length === 0 && legacyActivities.length > 0) {
        activities = legacyActivities
      }

      return { id, labels, activities }
    })
    .filter((c): c is CityOption => c !== null)
}

export function parseAppSettings(data: Record<string, unknown>): AppSettings {
  const legacyActivities = parseOptions(data.activities)

  return {
    expectedName: String(data.expectedName ?? '').trim(),
    blockedDates: Array.isArray(data.blockedDates)
      ? data.blockedDates.map(String)
      : [],
    cities: parseCities(data.cities, legacyActivities),
    surpriseEnabled: data.surpriseEnabled !== false,
  }
}

export function isSettingsReady(settings: AppSettings): boolean {
  return (
    Boolean(settings.expectedName) &&
    settings.cities.length > 0 &&
    settings.cities.every((city) => city.activities.length > 0)
  )
}
