import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { interpolate, type TranslationKey } from '../i18n/translations'
import type { DashboardInsight } from '../lib/analytics'

const toneStyles = {
  info: 'border-pink-800/40 bg-pink-950/30',
  highlight: 'border-pink-500/50 bg-pink-600/15',
  warning: 'border-amber-700/50 bg-amber-950/30',
}

export function InsightCard({
  insight,
  delay = 0,
}: {
  insight: DashboardInsight
  delay?: number
}) {
  const { locale, t } = useLanguage()
  const title = t(insight.titleKey as TranslationKey)
  const template = t(insight.bodyKey as TranslationKey)
  const body = insight.vars ? interpolate(template, insight.vars) : template

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl border p-4 ${toneStyles[insight.tone]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-pink-300/80">
        {locale === 'ar' ? '💡 رؤية' : '💡 Insight'}
      </p>
      <h4 className="mt-1 text-sm font-bold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-pink-100/85">{body}</p>
    </motion.div>
  )
}
