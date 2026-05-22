import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useLanguage } from '../../contexts/LanguageContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import type { ChartDatum } from '../../types/oncology'
import { ChartTooltip } from './ChartTooltip'

interface PieChartBlockProps {
  data: ChartDatum[]
  centerLabel?: string
}

export function PieChartBlock({ data, centerLabel }: PieChartBlockProps) {
  const { t } = useLanguage()
  const isMobile = useIsMobile()

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[180px] items-center justify-center text-sm text-pink-400/50">
        {t('noData')}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy={isMobile ? '42%' : '45%'}
          innerRadius={isMobile ? 42 : 50}
          outerRadius={isMobile ? 72 : 85}
          paddingAngle={3}
          animationBegin={200}
          animationDuration={1200}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill ?? '#f472b6'} />
          ))}
        </Pie>
        <Tooltip
          content={
            <ChartTooltip
              countLabel={t('chartCount')}
              showPercent
            />
          }
        />
        <Legend
          layout={isMobile ? 'horizontal' : 'horizontal'}
          verticalAlign="bottom"
          wrapperStyle={{
            fontSize: isMobile ? 10 : 11,
            color: '#f9a8d4',
            paddingTop: isMobile ? 4 : 8,
          }}
          formatter={(value) => (
            <span style={{ color: '#fbcfe8' }}>{value}</span>
          )}
        />
        {centerLabel && (
          <text
            x="50%"
            y={isMobile ? '40%' : '43%'}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={isMobile ? 14 : 16}
            fontWeight="bold"
          >
            {centerLabel}
          </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}
