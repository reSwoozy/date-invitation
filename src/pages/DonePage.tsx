import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AddToCalendar } from '../components/AddToCalendar'
import { loadConfetti } from '../utils/loadConfetti'
import { useBooking } from '../context/BookingContext'
import { useSettings } from '../hooks/useSettings'
import { formatDateForDisplay } from '../utils/dates'
import { findOptionLabel } from '../utils/labels'
import { findCityActivityLabel } from '../utils/settingsHelpers'

export function DonePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { booking, isComplete } = useBooking()
  const { settings } = useSettings()
  const fired = useRef(false)

  useEffect(() => {
    if (!isComplete) {
      navigate('/plan', { replace: true })
      return
    }
    if (fired.current) return
    fired.current = true

    let cancelled = false
    let raf = 0

    void loadConfetti().then((confetti) => {
      if (cancelled) return

      const duration = 2500
      const end = Date.now() + duration
      const colors = ['#ff6b9d', '#ff8fab', '#ffc2d1', '#fff']

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        })
        if (Date.now() < end) raf = requestAnimationFrame(frame)
      }
      frame()
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [isComplete, navigate])

  const { city, date, activity, guestName } = booking
  if (!isComplete || !city || !date || !activity || !settings) {
    return null
  }

  const lang = i18n.language
  const dateLabel = formatDateForDisplay(date, lang.startsWith('en') ? 'en' : 'nl')
  const cityLabel = findOptionLabel(settings.cities, city, lang)
  const activityLabel = findCityActivityLabel(settings, city, activity, lang)

  const calendarEvent = useMemo(
    () => ({
      title: t('done.calendarTitle', { city: cityLabel }),
      description: t('done.calendarDescription', {
        activity: activityLabel,
        guest: guestName || '',
      }),
      location: cityLabel,
      date,
    }),
    [t, cityLabel, activityLabel, guestName, date],
  )

  return (
    <motion.div
      className="page page-done"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="done-sparkles" aria-hidden="true">
        {['💕', '✨', '💖', '🌸', '💗'].map((emoji, i) => (
          <motion.span
            key={emoji}
            className="done-emoji"
            style={{ left: `${10 + i * 18}%` }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      <h1 className="done-message">
        {t('done.message', {
          date: dateLabel,
          city: cityLabel,
        })}
      </h1>
      <p className="done-activity">
        {t('done.activityLine', { activity: activityLabel })}
      </p>
      <AddToCalendar event={calendarEvent} />
    </motion.div>
  )
}
