import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ar from './locales/ar.json'
import zh from './locales/zh.json'

export const RTL_LANGUAGES = ['ar']

export const supportedLanguages = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'zh'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'al-surur-lang',
    },
  })

function applyDirection(lng: string) {
  const dir = RTL_LANGUAGES.includes(lng) ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lng
}

// Noto Sans SC (Chinese) is a large font family that the overwhelming
// majority of visitors (English/Arabic, UAE-based) never need — it was
// previously loaded synchronously for everyone via the base <link> in
// index.html, contributing real render-blocking weight to every page load.
// Load it only for the visitors who actually switch to Chinese.
let zhFontLoaded = false
function ensureZhFont(lng: string) {
  if (lng !== 'zh' || zhFontLoaded) return
  zhFontLoaded = true
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap'
  document.head.appendChild(link)
}

const initialLng = i18n.resolvedLanguage ?? i18n.language ?? 'en'
applyDirection(initialLng)
ensureZhFont(initialLng)
i18n.on('languageChanged', (lng) => {
  applyDirection(lng)
  ensureZhFont(lng)
})

export default i18n
