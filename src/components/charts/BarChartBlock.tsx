import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLanguage } from '../../contexts/LanguageContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { ChartDatum } from '../../types/oncology'
import { ChartTooltip } from './ChartTooltip'

interface BarChartBlockProps {
  data: ChartDatum[]
  layout?: 'horizontal' | 'vertical'
}

function wrapLabelLines(name: string, maxChars = 22): string[] {
  const words = name.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines.length > 0 ? lines : [name]
}

function estimateYAxisWidth(data: ChartDatum[], isMobile: boolean): number {
  let longest = 0
  for (const item of data) {
    for (const line of wrapLabelLines(item.name, 22)) {
      longest = Math.max(longest, line.length)
    }
  }
  const base = isMobile ? 130 : 150
  return Math.min(220, Math.max(base, longest * 6.5 + 24))
}

function HorizontalCategoryTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number
  y?: number
  payload?: { value?: string }
}) {
  const lines = wrapLabelLines(String(payload?.value ?? ''))
  const lineHeight = 15

  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="end" fill="#fbcfe8" fontSize={10}>
        {lines.map((text, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 4 : lineHeight}>
            {text}
          </tspan>
        ))}
      </text>
    </g>
  )
}

export function BarChartBlock({
  data,
  layout = 'vertical',
}: BarChartBlockProps) {
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const isSpacedHorizontal = layout === 'horizontal'
  const isHorizontal = isSpacedHorizontal || isMobile

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-pink-400/50">
        {t('noData')}
      </div>
    )
  }

  const yAxisWidth = isSpacedHorizontal
    ? estimateYAxisWidth(data, isMobile)
    : isMobile
      ? 100
      : 120
  const rowHeight = isSpacedHorizontal ? 62 : 40
  const chartHeight = isSpacedHorizontal
    ? Math.max(isMobile ? 380 : 480, data.length * rowHeight + 56)
    : undefined

  const sideMargin = isSpacedHorizontal ? 0 : isMobile ? 2 : 12

  const chart = (
    <BarChart
      data={data}
      layout={isHorizontal ? 'vertical' : 'horizontal'}
      barCategoryGap={isSpacedHorizontal ? '35%' : '18%'}
      barGap={isSpacedHorizontal ? 8 : 4}
      margin={{
        top: 12,
        right: sideMargin,
        left: sideMargin,
        bottom: isHorizontal ? 16 : isMobile ? 72 : 60,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#3d2430" />
      {isHorizontal ? (
        <>
          <XAxis
            type="number"
            tick={{ fill: '#f9a8d4', fontSize: isMobile ? 10 : 11 }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={yAxisWidth}
            interval={0}
            tick={isSpacedHorizontal ? <HorizontalCategoryTick /> : { fill: '#f9a8d4', fontSize: 9 }}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey="name"
            tick={{ fill: '#f9a8d4', fontSize: isMobile ? 9 : 10 }}
            angle={isMobile ? -35 : -25}
            textAnchor="end"
            height={isMobile ? 80 : 70}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#f9a8d4', fontSize: isMobile ? 10 : 11 }}
            allowDecimals={false}
            width={isMobile ? 28 : 36}
          />
        </>
      )}
      <Tooltip
        cursor={{ fill: 'rgba(190, 24, 93, 0.12)' }}
        content={<ChartTooltip countLabel={t('chartCount')} showPercent />}
      />
      <Bar
        dataKey="value"
        radius={isSpacedHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
        maxBarSize={isSpacedHorizontal ? 22 : isMobile ? 36 : 48}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.fill ?? '#f472b6'} />
        ))}
      </Bar>
    </BarChart>
  )

  const chartWrapperClass = 'w-full max-w-full mx-auto'
  const chartDir = { direction: 'ltr' as const }

  if (isSpacedHorizontal && chartHeight) {
    return (
      <div dir="ltr" className={chartWrapperClass} style={{ height: chartHeight, ...chartDir }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div dir="ltr" className="h-full w-full" style={chartDir}>
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  )
}
