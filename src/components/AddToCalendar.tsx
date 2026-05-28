import { useTranslation } from 'react-i18next'
import {
  buildIcsContent,
  downloadIcsFile,
  googleCalendarUrl,
  outlookCalendarUrl,
  type CalendarEvent,
} from '../utils/calendar'

interface AddToCalendarProps {
  event: CalendarEvent
}

export function AddToCalendar({ event }: AddToCalendarProps) {
  const { t } = useTranslation()

  const handleIcsDownload = () => {
    const content = buildIcsContent(event)
    downloadIcsFile(content, 'date-invitation.ics')
  }

  return (
    <div className="add-to-calendar">
      <p className="add-to-calendar-title">{t('done.addToCalendar')}</p>
      <div className="calendar-links">
        <a
          className="btn btn-calendar"
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('done.googleCalendar')}
        </a>
        <button type="button" className="btn btn-calendar" onClick={handleIcsDownload}>
          {t('done.appleCalendar')}
        </button>
        <a
          className="btn btn-calendar"
          href={outlookCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('done.outlookCalendar')}
        </a>
      </div>
      <p className="add-to-calendar-hint">{t('done.calendarHint')}</p>
    </div>
  )
}
