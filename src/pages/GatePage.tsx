import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { fetchBooking, namesMatch } from '../firebase'
import { useBooking } from '../context/BookingContext'
import { useSettings } from '../hooks/useSettings'
import { useVerified } from '../hooks/useVerified'
import { isSettingsReady } from '../utils/parseSettings'

export function GatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, loading, error: settingsError } = useSettings()
  const { setVerified } = useVerified()
  const { setGuestName, applyBooking } = useBooking()
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!settings || !name.trim() || submitting) return

    setSubmitting(true)
    setError(false)

    if (!namesMatch(name, settings.expectedName)) {
      setError(true)
      setSubmitting(false)
      return
    }

    const guestName = name.trim()
    setVerified(guestName)
    setGuestName(guestName)

    try {
      const existing = await fetchBooking(guestName)
      if (existing && namesMatch(guestName, existing.guestName)) {
        applyBooking(existing)
        navigate('/booked', { replace: true })
        return
      }
    } catch (err) {
      console.warn('fetchBooking failed:', err)
    }

    navigate('/ask')
  }

  if (loading) {
    return (
      <div className="page page-center page-stack">
        <p className="muted">{t('gate.loading')}</p>
      </div>
    )
  }

  if (settingsError || !settings || !isSettingsReady(settings)) {
    return (
      <div className="page page-center">
        <p className="field-error">{t('gate.configError')}</p>
      </div>
    )
  }

  return (
    <motion.div
      className="page page-center page-stack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="title-script">{t('gate.title')}</h1>
      <p className="gate-hint">{t('gate.hint')}</p>
      <form className="gate-form" onSubmit={(e) => void handleSubmit(e)}>
        <input
          type="text"
          className="input-text"
          placeholder={t('gate.placeholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError(false)
          }}
          autoComplete="name"
          required
        />
        {error && <p className="field-error shake">{t('gate.error')}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || !name.trim()}
        >
          {submitting ? t('gate.loading') : t('gate.submit')}
        </button>
      </form>
    </motion.div>
  )
}
