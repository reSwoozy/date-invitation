export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function isDayDisabled(date: Date, blockedDates: string[]): boolean {
  const iso = toIsoDate(date)
  return isDateInPast(iso) || isDateBlocked(iso, blockedDates)
}

export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isDateBlocked(date: string, blockedDates: string[]): boolean {
  return blockedDates.includes(date)
}

export function isDateInPast(date: string): boolean {
  return date < todayIso()
}

const MONTHS_RU_GENITIVE = [
  'Января',
  'Февраля',
  'Марта',
  'Апреля',
  'Мая',
  'Июня',
  'Июля',
  'Августа',
  'Сентября',
  'Октября',
  'Ноября',
  'Декабря',
]

export function formatDateForTelegram(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return `${d} ${MONTHS_RU_GENITIVE[m - 1]} ${y}`
}

export function formatDateForDisplay(date: string, locale: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const parsed = new Date(y, m - 1, d)
  return parsed.toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
