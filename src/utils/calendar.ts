export interface CalendarEvent {
  title: string
  description: string
  location: string
  date: string
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function toIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

function nextIsoDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const next = new Date(y, m - 1, d + 1)
  const ny = next.getFullYear()
  const nm = String(next.getMonth() + 1).padStart(2, '0')
  const nd = String(next.getDate()).padStart(2, '0')
  return `${ny}-${nm}-${nd}`
}

export function buildIcsContent(event: CalendarEvent): string {
  const start = toIcsDate(event.date)
  const end = toIcsDate(nextIsoDate(event.date))
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  const uid = `${stamp}@date-invitation`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DateInvitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(event.description)}`,
    `LOCATION:${icsEscape(event.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const start = toIcsDate(event.date)
  const end = toIcsDate(nextIsoDate(event.date))
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function outlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    location: event.location,
    startdt: event.date,
    enddt: nextIsoDate(event.date),
    allday: 'true',
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}
