import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AddToCalendar } from '../components/AddToCalendar'
import { useBooking } from '../context/BookingContext'
import { useSettings } from '../hooks/useSettings'
import { formatDateForDisplay } from '../utils/dates'
import { findOptionLabel } from '../utils/labels'
import { findCityActivityLabel } from '../utils/settingsHelpers'

export function BookedPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { booking, isComplete } = useBooking()
  const { settings } = useSettings()

  useEffect(() => {
    if (!isComplete) {
      navigate('/plan', { replace: true })
    }
  }, [isComplete, navigate])

  const { city, date, activity, guestName } = booking

  const lang = i18n.language
  const dateLabel =
    date &&
    formatDateForDisplay(date, lang.startsWith('en') ? 'en' : 'nl')
  const cityLabel =
    settings && city ? findOptionLabel(settings.cities, city, lang) : ''
  const activityLabel =
    settings && city && activity
      ? findCityActivityLabel(settings, city, activity, lang)
      : ''

  const calendarEvent = useMemo(
    () => ({
      title: t('done.calendarTitle', { city: cityLabel }),
      description: t('done.calendarDescription', {
        activity: activityLabel,
        guest: guestName || '',
      }),
      location: cityLabel,
      date: date || '',
    }),
    [t, cityLabel, activityLabel, guestName, date],
  )

  if (!isComplete || !city || !date || !activity || !settings) {
    return null
  }

  return (
    <motion.div
      className="page page-booked"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="done-message">
        {t('booked.message', {
          date: dateLabel,
          city: cityLabel,
        })}
      </h1>
      <p className="done-activity">
        {t('booked.activityLine', { activity: activityLabel })}
      </p>
      <AddToCalendar event={calendarEvent} />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => navigate('/plan')}
      >
        {t('booked.changePlans')}
      </button>
    </motion.div>
  )
}
