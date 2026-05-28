import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FireworksBackground } from '../components/FireworksBackground'

export function CelebratePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    void import('./PlanPage')
    void import('../components/DatePicker')
  }, [])

  return (
    <motion.div
      className="page page-celebrate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <FireworksBackground />
      <motion.h1
        className="title-script celebrate-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {t('celebrate.message')}
      </motion.h1>
      <motion.button
        type="button"
        className="btn btn-primary celebrate-cta"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/plan')}
      >
        {t('celebrate.continue')}
      </motion.button>
    </motion.div>
  )
}
