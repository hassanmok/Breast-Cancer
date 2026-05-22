import { useLanguage } from '../contexts/LanguageContext'
import type { Locale } from '../i18n/translations'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage()

  const options: { value: Locale; label: string }[] = [
    { value: 'ar', label: 'عربي' },
    { value: 'en', label: 'EN' },
  ]

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-[#3d2430] bg-black/30 p-0.5 ${className}`}
      role="group"
      aria-label={t('language')}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
            locale === opt.value
              ? 'bg-pink-600 text-white shadow-sm'
              : 'text-pink-300/80 hover:bg-pink-950/50 hover:text-pink-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
