import { useTranslation } from 'react-i18next'

export function PageSpinner() {
  const { t } = useTranslation()
  return (
    <div className="page page-center">
      <p className="muted">{t('gate.loading')}</p>
    </div>
  )
}
