import type { ChartDatum, OncologyCase } from '../types/oncology'

const CHART_COLORS = [
  '#f472b6',
  '#fb7185',
  '#fda4af',
  '#e879f9',
  '#c084fc',
  '#a78bfa',
  '#818cf8',
  '#67e8f9',
]

export interface AnalyticsLabels {
  undefined: string
  bucketLt15: string
  bucket15_25: string
  bucket25_35: string
  bucketGt35: string
  bucketUnknown: string
  ageUnder40: string
  age40_49: string
  age50_59: string
  age60_69: string
  age70plus: string
  ageUnknown: string
  genderFemale: string
  genderMale: string
}

export interface DashboardInsight {
  id: string
  titleKey: string
  bodyKey: string
  vars?: Record<string, string | number>
  tone: 'info' | 'highlight' | 'warning'
}

function isFilled(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== ''
}

function pct(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100)
}

function countByField(
  cases: OncologyCase[],
  field: keyof OncologyCase,
  emptyLabel: string,
  total: number,
): ChartDatum[] {
  const counts = new Map<string, number>()

  for (const row of cases) {
    const raw = row[field]
    const label = isFilled(raw) ? String(raw) : emptyLabel
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, value], i) => ({
      name,
      value,
      percent: pct(value, total),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
}

function countReceptorProfile(cases: OncologyCase[], labels: AnalyticsLabels) {
  const profiles = new Map<string, number>()
  for (const row of cases) {
    const er = isFilled(row.er_status) ? row.er_status! : labels.undefined
    const her2 = isFilled(row.her2_status) ? row.her2_status! : labels.undefined
    const pr = isFilled(row.pr_status) ? row.pr_status! : labels.undefined
    const key = `${er} / ${her2} / ${pr}`
    profiles.set(key, (profiles.get(key) ?? 0) + 1)
  }
  return [...profiles.entries()]
    .map(([name, value], i) => ({
      name,
      value,
      percent: pct(value, cases.length),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
}

function buildAgeBuckets(cases: OncologyCase[], labels: AnalyticsLabels, total: number) {
  const buckets = [
    { name: labels.ageUnder40, min: 0, max: 40 },
    { name: labels.age40_49, min: 40, max: 50 },
    { name: labels.age50_59, min: 50, max: 60 },
    { name: labels.age60_69, min: 60, max: 70 },
    { name: labels.age70plus, min: 70, max: 200 },
  ]
  const withAge = cases.filter((c) => c.age != null)
  const data = buckets.map((b, i) => {
    const value = withAge.filter((c) => {
      const a = Number(c.age)
      return a >= b.min && a < b.max
    }).length
    return { name: b.name, value, percent: pct(value, total), fill: CHART_COLORS[i % CHART_COLORS.length] }
  })
  const unknown = total - withAge.length
  if (unknown > 0) {
    data.push({
      name: labels.ageUnknown,
      value: unknown,
      percent: pct(unknown, total),
      fill: '#6b7280',
    })
  }
  return data
}

function buildGenderChart(cases: OncologyCase[], labels: AnalyticsLabels, total: number) {
  const female = cases.filter((c) => c.gender === 'Female').length
  const male = cases.filter((c) => c.gender === 'Male').length
  const other = total - female - male
  const items: ChartDatum[] = [
    { name: labels.genderFemale, value: female, percent: pct(female, total), fill: '#f472b6' },
    { name: labels.genderMale, value: male, percent: pct(male, total), fill: '#818cf8' },
  ]
  if (other > 0) {
    items.push({ name: labels.undefined, value: other, percent: pct(other, total), fill: '#6b7280' })
  }
  return items.filter((d) => d.value > 0)
}

export function buildDashboardStats(cases: OncologyCase[], labels: AnalyticsLabels) {
  const total = cases.length
  const withSize = cases.filter((c) => c.tumor_size != null)
  const avgTumorSize =
    withSize.length > 0
      ? withSize.reduce((s, c) => s + Number(c.tumor_size), 0) / withSize.length
      : 0

  const grades = cases.filter((c) => c.grade != null)
  const avgGrade =
    grades.length > 0
      ? grades.reduce((s, c) => s + Number(c.grade), 0) / grades.length
      : 0

  const withAge = cases.filter((c) => c.age != null)
  const avgAge =
    withAge.length > 0
      ? withAge.reduce((s, c) => s + Number(c.age), 0) / withAge.length
      : 0

  const manualCount = cases.filter((c) => c.source === 'manual').length
  const datasetCount = cases.filter((c) => c.source === 'dataset').length
  const primaryCount = cases.filter((c) => c.sample_type === 'Primary').length
  const stageKnown = cases.filter((c) => isFilled(c.tumor_stage)).length
  const breastCount = cases.filter((c) => c.cancer_type === 'Breast Cancer').length
  const erPositive = cases.filter((c) => c.er_status === 'Positive').length
  const her2Positive = cases.filter((c) => c.her2_status === 'Positive').length
  const grade3 = cases.filter((c) => c.grade === 3).length
  const femaleCount = cases.filter((c) => c.gender === 'Female').length

  const byCancerDetailed = countByField(cases, 'cancer_type_detailed', labels.undefined, total)
  const byErStatus = countByField(cases, 'er_status', labels.undefined, total)
  const byHer2Status = countByField(cases, 'her2_status', labels.undefined, total)
  const byGrade = countByField(cases, 'grade', labels.undefined, total)

  const insights = buildInsights({
    total,
    breastCount,
    avgAge,
    femaleCount,
    erPositive,
    her2Positive,
    grade3,
    avgTumorSize,
    withSizeCount: withSize.length,
    topSubtype: byCancerDetailed[0],
    topEr: byErStatus.find((d) => d.name !== labels.undefined),
    topHer2: byHer2Status.find((d) => d.name === 'Positive'),
    topGrade: byGrade.find((d) => d.name === '3'),
  })

  return {
    total,
    avgTumorSize: Math.round(avgTumorSize * 10) / 10,
    avgGrade: Math.round(avgGrade * 10) / 10,
    avgAge: Math.round(avgAge * 10) / 10,
    manualCount,
    datasetCount,
    primaryCount,
    primaryPercent: pct(primaryCount, total),
    breastPercent: pct(breastCount, total),
    stageKnownPercent: pct(stageKnown, total),
    tumorSizeKnownPercent: pct(withSize.length, total),
    ageKnownPercent: pct(withAge.length, total),
    femalePercent: pct(femaleCount, total),
    erPositiveCount: erPositive,
    erPositivePercent: pct(erPositive, total),
    her2PositivePercent: pct(her2Positive, total),
    grade3Percent: pct(grade3, total),
    insights,
    byCancerType: countByField(cases, 'cancer_type', labels.undefined, total),
    byCancerDetailed: byCancerDetailed.slice(0, 8),
    byErStatus,
    byHer2Status,
    byPrStatus: countByField(cases, 'pr_status', labels.undefined, total),
    byGrade,
    bySampleType: countByField(cases, 'sample_type', labels.undefined, total),
    byTumorStage: countByField(cases, 'tumor_stage', labels.undefined, total),
    byGender: buildGenderChart(cases, labels, total),
    byAge: buildAgeBuckets(cases, labels, total),
    receptorProfiles: countReceptorProfile(cases, labels),
    tumorSizeBuckets: buildTumorSizeBuckets(cases, labels, total),
  }
}

function buildInsights(ctx: {
  total: number
  breastCount: number
  avgAge: number
  femaleCount: number
  erPositive: number
  her2Positive: number
  grade3: number
  avgTumorSize: number
  withSizeCount: number
  topSubtype?: ChartDatum
  topEr?: ChartDatum
  topHer2?: ChartDatum
  topGrade?: ChartDatum
}): DashboardInsight[] {
  const insights: DashboardInsight[] = []
  if (ctx.total === 0) return insights

  insights.push({
    id: 'volume',
    titleKey: 'insightVolumeTitle',
    bodyKey: 'insightVolumeBody',
    vars: { total: ctx.total, breast: ctx.breastCount, breastPct: pct(ctx.breastCount, ctx.total) },
    tone: 'highlight',
  })

  if (ctx.topSubtype?.name) {
    insights.push({
      id: 'subtype',
      titleKey: 'insightSubtypeTitle',
      bodyKey: 'insightSubtypeBody',
      vars: {
        name: ctx.topSubtype.name,
        count: ctx.topSubtype.value,
        percent: ctx.topSubtype.percent ?? 0,
      },
      tone: 'info',
    })
  }

  if (ctx.avgAge > 0) {
    insights.push({
      id: 'demographics',
      titleKey: 'insightDemographicsTitle',
      bodyKey: 'insightDemographicsBody',
      vars: {
        avgAge: ctx.avgAge,
        femalePct: pct(ctx.femaleCount, ctx.total),
      },
      tone: 'info',
    })
  }

  insights.push({
    id: 'er',
    titleKey: 'insightErTitle',
    bodyKey: 'insightErBody',
    vars: {
      percent: pct(ctx.erPositive, ctx.total),
      count: ctx.erPositive,
    },
    tone: 'info',
  })

  if (ctx.topGrade) {
    insights.push({
      id: 'grade',
      titleKey: 'insightGradeTitle',
      bodyKey: 'insightGradeBody',
      vars: {
        percent: pct(ctx.grade3, ctx.total),
        count: ctx.grade3,
      },
      tone: 'info',
    })
  }

  return insights.slice(0, 5)
}

function buildTumorSizeBuckets(
  cases: OncologyCase[],
  labels: AnalyticsLabels,
  total: number,
): ChartDatum[] {
  const buckets = [
    { name: labels.bucketLt15, min: 0, max: 15 },
    { name: labels.bucket15_25, min: 15, max: 25 },
    { name: labels.bucket25_35, min: 25, max: 35 },
    { name: labels.bucketGt35, min: 35, max: Infinity },
  ]

  const sized = cases.filter((c) => c.tumor_size != null)
  const bucketData = buckets.map((b, i) => {
    const value = sized.filter((c) => {
      const s = Number(c.tumor_size)
      return s >= b.min && s < b.max
    }).length
    return {
      name: b.name,
      value,
      percent: pct(value, total),
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }
  })

  const unknownCount = total - sized.length
  if (unknownCount > 0) {
    bucketData.push({
      name: labels.bucketUnknown,
      value: unknownCount,
      percent: pct(unknownCount, total),
      fill: '#6b7280',
    })
  }

  return bucketData
}
