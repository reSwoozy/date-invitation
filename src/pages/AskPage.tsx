import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { RunawayNoButton } from '../components/RunawayNoButton'

export function AskPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <motion.div
      className="page page-ask"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h1 className="ask-question">{t('ask.question')}</h1>
      <div className="ask-buttons">
        <button
          type="button"
          className="btn btn-yes"
          onClick={() => navigate('/celebrate')}
        >
          {t('ask.yes')} 💕
        </button>
        <RunawayNoButton />
      </div>
    </motion.div>
  )
}
