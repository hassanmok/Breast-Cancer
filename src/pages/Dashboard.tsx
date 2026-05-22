import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchAllOncologyCases } from '../lib/oncologyCases'
import { buildDashboardStats } from '../lib/analytics'
import { useLanguage } from '../contexts/LanguageContext'
import type { OncologyCase } from '../types/oncology'
import { StatCard } from '../components/StatCard'
import { ChartCard } from '../components/ChartCard'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { InsightCard } from '../components/InsightCard'
import { BarChartBlock } from '../components/charts/BarChartBlock'
import { PieChartBlock } from '../components/charts/PieChartBlock'

export function Dashboard() {
  const { t } = useLanguage()
  const [cases, setCases] = useState<OncologyCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsMigration, setNeedsMigration] = useState(false)
  const [analyzing, setAnalyzing] = useState(true)

  const analyticsLabels = useMemo(
    () => ({
      undefined: t('undefined'),
      bucketLt15: t('bucketLt15'),
      bucket15_25: t('bucket15_25'),
      bucket25_35: t('bucket25_35'),
      bucketGt35: t('bucketGt35'),
      bucketUnknown: t('bucketUnknown'),
      ageUnder40: t('ageUnder40'),
      age40_49: t('age40_49'),
      age50_59: t('age50_59'),
      age60_69: t('age60_69'),
      age70plus: t('age70plus'),
      ageUnknown: t('ageUnknown'),
      genderFemale: t('genderFemale'),
      genderMale: t('genderMale'),
    }),
    [t],
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      setNeedsMigration(false)

      const { data, error: err, needsMigration: migration } = await fetchAllOncologyCases()

      if (err) {
        setError(err)
        setCases([])
      } else {
        setNeedsMigration(migration)
        setCases(data)
      }
      setLoading(false)
      setTimeout(() => setAnalyzing(false), 1400)
    }
    load()
  }, [])

  const stats = useMemo(
    () => buildDashboardStats(cases, analyticsLabels),
    [cases, analyticsLabels],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 sm:py-24">
        <motion.div
          className="relative h-16 w-16 sm:h-20 sm:w-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-pink-500/30" />
          <div className="absolute inset-0 rounded-full border-t-2 border-pink-500" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="px-4 text-center text-sm text-pink-200"
        >
          {t('loadingData')}
        </motion.p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl border border-red-900/50 p-4 text-center sm:p-6">
        <p className="text-sm text-red-300 sm:text-base">
          {t('loadError')}: {error}
        </p>
        <p className="mt-2 text-xs text-pink-400/60 sm:text-sm">{t('loadErrorHint')}</p>
      </div>
    )
  }

  if (stats.total === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center sm:p-10">
        <p className="text-4xl">📭</p>
        <h2 className="mt-3 text-lg font-bold text-white">{t('emptyDataTitle')}</h2>
        <p className="mt-2 text-sm text-pink-300/70">{t('emptyDataBody')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {needsMigration && (
        <div className="rounded-2xl border border-amber-700/50 bg-amber-950/40 p-4">
          <p className="font-semibold text-amber-200">{t('migrationBannerTitle')}</p>
          <p className="mt-1 text-sm text-amber-100/80">{t('migrationBannerBody')}</p>
        </div>
      )}

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white sm:text-3xl">{t('dashboardTitle')}</h1>
          <p className="mt-1 text-xs text-pink-300/70 sm:text-sm">{t('dashboardSubtitle')}</p>
        </div>
        {analyzing && (
          <motion.span className="w-fit rounded-full bg-pink-600/30 px-3 py-1.5 text-xs text-pink-200">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {t('analyzing')}
            </motion.span>
          </motion.span>
        )}
      </motion.header>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pink-400/80">
          {t('sectionOverview')}
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            label={t('statTotal')}
            value={<AnimatedCounter value={stats.total} />}
            sub={t('statTotalSub', { dataset: stats.datasetCount, manual: stats.manualCount })}
            delay={0}
          />
          <StatCard
            label={t('statAvgAge')}
            value={<AnimatedCounter value={stats.avgAge} decimals={0} />}
            sub={t('statAvgAgeSub', { percent: stats.ageKnownPercent })}
            delay={0.05}
            accent="from-rose-600 to-orange-400"
          />
          <StatCard
            label={t('statErPositive')}
            value={<AnimatedCounter value={stats.erPositivePercent} suffix="%" />}
            sub={t('statErPositiveSub', { count: stats.erPositiveCount, total: stats.total })}
            delay={0.1}
            accent="from-violet-600 to-purple-400"
          />
          <StatCard
            label={t('statAvgTumor')}
            value={<AnimatedCounter value={stats.avgTumorSize} decimals={1} />}
            sub={t('statAvgTumorSub', { percent: stats.tumorSizeKnownPercent })}
            delay={0.15}
            accent="from-fuchsia-600 to-pink-400"
          />
        </div>
      </section>

      {stats.insights.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pink-400/80">
            {t('sectionInsights')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} delay={i * 0.08} />
            ))}
          </div>
        </section>
      )}

      {!needsMigration && stats.byGender.some((d) => d.value > 0) && (
        <section>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-pink-400/80">
            {t('sectionDemographics')}
          </h2>
          <p className="mb-3 text-xs text-pink-300/55">
            {t('sectionDemographicsSub', { total: stats.total })}
          </p>
          <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
            <ChartCard title={t('chartGender')} delay={0.15}>
              <PieChartBlock data={stats.byGender} />
            </ChartCard>
            <ChartCard title={t('chartAge')} subtitle={t('chartAgeSub')} delay={0.2}>
              <BarChartBlock data={stats.byAge} />
            </ChartCard>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pink-400/80">
          {t('sectionBiomarkersCharts')}
        </h2>
        <p className="mb-3 text-xs text-pink-300/55">{t('sectionBiomarkersChartsSub')}</p>
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <ChartCard title={t('chartEr')} subtitle={t('chartPercentHint')} delay={0.2}>
            <PieChartBlock data={stats.byErStatus} centerLabel={String(stats.total)} />
          </ChartCard>
          <ChartCard title={t('chartHer2')} subtitle={t('chartPercentHint')} delay={0.25}>
            <PieChartBlock data={stats.byHer2Status} />
          </ChartCard>
          <ChartCard title={t('chartPr')} subtitle={t('chartPercentHint')} delay={0.3}>
            <BarChartBlock data={stats.byPrStatus} />
          </ChartCard>
          <ChartCard
            title={t('chartReceptorProfile')}
            subtitle={t('chartReceptorProfileSub')}
            delay={0.35}
            autoHeight
          >
            <BarChartBlock data={stats.receptorProfiles} layout="horizontal" />
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pink-400/80">
          {t('sectionTumorCharts')}
        </h2>
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <ChartCard title={t('chartGrade')} delay={0.4}>
            <BarChartBlock data={stats.byGrade} />
          </ChartCard>
          <ChartCard
            title={t('chartTumorStage')}
            subtitle={t('chartStageSub', { percent: stats.stageKnownPercent })}
            delay={0.45}
          >
            <BarChartBlock data={stats.byTumorStage} />
          </ChartCard>
          <ChartCard title={t('chartTumorSize')} subtitle={t('chartTumorSizeSub')} delay={0.5}>
            <BarChartBlock data={stats.tumorSizeBuckets} />
          </ChartCard>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-pink-400/80">
          {t('sectionClassification')}
        </h2>
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <ChartCard title={t('chartCancerType')} delay={0.6}>
            <PieChartBlock data={stats.byCancerType} />
          </ChartCard>
          <ChartCard
            title={t('chartDetailed')}
            subtitle={t('chartDetailedSub')}
            delay={0.65}
            autoHeight
            className="lg:col-span-2"
          >
            <BarChartBlock data={stats.byCancerDetailed} layout="horizontal" />
          </ChartCard>
        </div>
      </section>
    </div>
  )
}
