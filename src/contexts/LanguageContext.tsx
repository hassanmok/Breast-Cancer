import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  interpolate,
  translations,
  type Locale,
  type TranslationKey,
} from '../i18n/translations'

const STORAGE_KEY = 'oncology-registry-locale'

interface LanguageContextValue {
  locale: Locale
  dir: 'rtl' | 'ltr'
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'ar' ? stored : 'ar'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const dir: 'rtl' | 'ltr' = locale === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
    document.title =
      locale === 'ar'
        ? 'سجل سرطان الثدي | Oncology Registry'
        : 'Breast Cancer Registry | Oncology Registry'
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale, dir])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar'))
  }, [])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const text = translations[locale][key]
      return vars ? interpolate(text, vars) : text
    },
    [locale],
  )

  const value = useMemo(
    () => ({ locale, dir, setLocale, toggleLocale, t }),
    [locale, dir, setLocale, toggleLocale, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
