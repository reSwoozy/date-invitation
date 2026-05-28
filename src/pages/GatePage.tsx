import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { namesMatch } from '../firebase'
import { useBooking } from '../context/BookingContext'
import { useSettings } from '../hooks/useSettings'
import { useVerified } from '../hooks/useVerified'
import { isSettingsReady } from '../utils/parseSettings'

export function GatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { settings, loading, error: settingsError } = useSettings()
  const { setVerified } = useVerified()
  const { setGuestName } = useBooking()
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!settings || !name.trim()) return

    setSubmitting(true)
    if (namesMatch(name, settings.expectedName)) {
      setVerified(name.trim())
      setGuestName(name.trim())
      navigate('/ask')
    } else {
      setError(true)
      setSubmitting(false)
    }
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
      <form className="gate-form" onSubmit={handleSubmit}>
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
          {t('gate.submit')}
        </button>
      </form>
    </motion.div>
  )
}
