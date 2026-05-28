import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import nl from './locales/nl.json'
import en from './locales/en.json'

const STORAGE_KEY = 'dateInviteLocale'

const saved = localStorage.getItem(STORAGE_KEY)
const initialLng = saved === 'en' || saved === 'nl' ? saved : 'nl'

void i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: nl },
    en: { translation: en },
  },
  lng: initialLng,
  fallbackLng: 'nl',
  interpolation: { escapeValue: false },
})

export function setAppLanguage(lng: 'nl' | 'en') {
  localStorage.setItem(STORAGE_KEY, lng)
  void i18n.changeLanguage(lng)
}

export default i18n
