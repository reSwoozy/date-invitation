import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarSkeleton } from '../components/CalendarSkeleton'
import { saveBooking } from '../firebase'
import { useBooking } from '../context/BookingContext'
import { useSettings } from '../hooks/useSettings'
import { useVerified } from '../hooks/useVerified'
import { isDateBlocked } from '../utils/dates'
import { findOptionLabel, optionLabel } from '../utils/labels'
import { isSettingsReady } from '../utils/parseSettings'
import { getCityActivities } from '../utils/settingsHelpers'
import { canNotifyTelegram, notifyTelegram } from '../utils/notifyTelegram'
import { runSurprisePick } from '../utils/surpriseActivity'

const LazyDatePicker = lazy(() =>
  import('../components/DatePicker').then((m) => ({ default: m.DatePicker })),
)

export function PlanPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { settings, loading: settingsLoading } = useSettings()
  const { guestName } = useVerified()
  const {
    booking,
    setCity,
    setDate,
    setActivity,
    isComplete,
  } = useBooking()
  const [dateError, setDateError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinHighlight, setSpinHighlight] = useState<string | null>(null)
  const [showSurpriseResult, setShowSurpriseResult] = useState(false)
  const spinAbort = useRef(false)

  const lang = i18n.language
  const cities = settings?.cities ?? []
  const activities =
    settings && booking.city
      ? getCityActivities(settings, booking.city)
      : []
  const activityIds = activities.map((a) => a.id)
  const surpriseEnabled = settings?.surpriseEnabled ?? false

  const handlePickCity = (cityId: string) => {
    setCity(cityId)
    if (!settings) return
    const forCity = getCityActivities(settings, cityId)
    if (
      booking.activity &&
      !forCity.some((a) => a.id === booking.activity)
    ) {
      setActivity('')
      setShowSurpriseResult(false)
    }
  }

  useEffect(() => {
    void import('../components/DatePicker')
  }, [])

  const blockedDates = settings?.blockedDates ?? []
  const cityChosen = Boolean(booking.city)
  const dateChosen = Boolean(booking.date)
  const activityChosen = Boolean(booking.activity)
  const canConfirm = cityChosen && dateChosen && activityChosen

  const handleDateChange = (value: string) => {
    if (value && isDateBlocked(value, blockedDates)) {
      setDateError(t('plan.dateBlocked'))
      setDate('')
      return
    }
    setDateError(null)
    setDate(value)
  }

  const handlePickActivity = (actId: string) => {
    if (isSpinning) {
      spinAbort.current = true
      setIsSpinning(false)
      setSpinHighlight(null)
      setShowSurpriseResult(false)
    }
    setActivity(actId)
  }

  const handleSurprise = async () => {
    if (isSpinning || activityIds.length === 0) return
    spinAbort.current = false
    setShowSurpriseResult(false)
    setActivity('')
    setIsSpinning(true)
    setSpinHighlight(activityIds[0]!)

    try {
      const final = await runSurprisePick(activityIds, (actId) => {
        if (!spinAbort.current) setSpinHighlight(actId)
      })

      if (spinAbort.current) return

      setSpinHighlight(final)
      setActivity(final)
      setShowSurpriseResult(true)
    } finally {
      if (!spinAbort.current) {
        setIsSpinning(false)
      }
    }
  }

  const isChipActive = (actId: string) => {
    if (isSpinning) return spinHighlight === actId
    return booking.activity === actId
  }

  const handleConfirm = async () => {
    const { city, date, activity, guestName: bookingGuest } = booking
    if (!isComplete || !city || !date || !activity || !settings) return

    setSaving(true)
    setSaveError(false)
    try {
      const locale = i18n.language.startsWith('en') ? 'en' : 'nl'
      const bookingData = {
        guestName: guestName || bookingGuest || '',
        city,
        date,
        activity,
        locale,
      }

      await saveBooking(bookingData)

      if (canNotifyTelegram()) {
        try {
          await notifyTelegram(bookingData, settings)
        } catch (notifyErr) {
          console.warn('Telegram notify failed:', notifyErr)
        }
      }

      navigate('/done')
    } catch (err) {
      console.error('saveBooking failed:', err)
      setSaveError(true)
      setSaving(false)
    }
  }

  if (settingsLoading && !settings) {
    return (
      <div className="page page-center">
        <p className="muted">{t('gate.loading')}</p>
      </div>
    )
  }

  if (!settings || !isSettingsReady(settings)) {
    return (
      <div className="page page-center">
        <p className="field-error">{t('gate.configError')}</p>
      </div>
    )
  }

  return (
    <motion.div
      className="page page-plan"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section className="plan-section">
        <p className="section-label">{t('plan.cityTitle')}</p>
        <div className="chip-row">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              className={`chip ${booking.city === city.id ? 'chip-active' : ''}`}
              onClick={() => handlePickCity(city.id)}
            >
              {optionLabel(city, lang)}
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {cityChosen && (
          <motion.section
            className="plan-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Suspense fallback={<CalendarSkeleton />}>
              <LazyDatePicker
                date={booking.date ?? ''}
                blockedDates={blockedDates}
                dateError={dateError}
                onDateChange={handleDateChange}
              />
            </Suspense>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cityChosen && dateChosen && (
          <motion.section
            className="plan-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="section-label">{t('plan.activityTitle')}</p>
            <div className="chip-row">
              {activities.map((act) => (
                <motion.button
                  key={act.id}
                  type="button"
                  disabled={isSpinning}
                  className={`chip ${isChipActive(act.id) ? 'chip-active' : ''} ${isSpinning && spinHighlight === act.id ? 'chip-spinning' : ''}`}
                  onClick={() => handlePickActivity(act.id)}
                  animate={
                    isSpinning && spinHighlight === act.id
                      ? { scale: [1, 1.08, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.12 }}
                >
                  {optionLabel(act, lang)}
                </motion.button>
              ))}
              {surpriseEnabled && (
                <motion.button
                  type="button"
                  disabled={isSpinning}
                  className={`chip chip-surprise ${isSpinning ? 'chip-surprise-active' : ''}`}
                  onClick={() => void handleSurprise()}
                  whileTap={isSpinning ? undefined : { scale: 0.96 }}
                >
                  {isSpinning ? t('plan.surpriseSpinning') : t('plan.surprise')}
                </motion.button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isSpinning && (
                <motion.p
                  key="spinning"
                  className="surprise-status"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {t('plan.surpriseSpinning')}
                </motion.p>
              )}
              {!isSpinning && showSurpriseResult && booking.activity && (
                <motion.p
                  key="result"
                  className="surprise-result"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {t('plan.surpriseResult', {
                    activity: findOptionLabel(
                      activities,
                      booking.activity,
                      lang,
                    ),
                  })}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>

      {canConfirm && (
        <div className="plan-confirm-wrap">
          <button
            type="button"
            className="btn btn-primary btn-large"
            disabled={saving || isSpinning}
            onClick={() => void handleConfirm()}
          >
            {saving ? t('plan.saving') : t('plan.confirm')}
          </button>
          {saveError && (
            <p className="field-error">{t('plan.saveError')}</p>
          )}
        </div>
      )}
    </motion.div>
  )
}
