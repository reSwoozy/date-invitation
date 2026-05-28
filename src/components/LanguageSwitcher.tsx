import { useTranslation } from 'react-i18next'
import { setAppLanguage } from '../i18n'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = i18n.language.startsWith('en') ? 'en' : 'nl'

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      <button
        type="button"
        className={current === 'nl' ? 'active' : ''}
        onClick={() => setAppLanguage('nl')}
      >
        {t('layout.langNl')}
      </button>
      <span className="lang-divider">|</span>
      <button
        type="button"
        className={current === 'en' ? 'active' : ''}
        onClick={() => setAppLanguage('en')}
      >
        {t('layout.langEn')}
      </button>
    </div>
  )
}
