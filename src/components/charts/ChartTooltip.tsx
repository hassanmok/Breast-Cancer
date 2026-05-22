import type { ChartDatum } from '../../types/oncology'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    value?: number
    name?: string
    payload?: ChartDatum
  }>
  label?: string | number
  countLabel: string
  showPercent?: boolean
}

export function ChartTooltip({
  active,
  payload,
  label,
  countLabel,
  showPercent = true,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const value = item?.value ?? 0
  const datum = item?.payload
  const percent = datum?.percent
  const displayName = item?.name ?? datum?.name ?? (label != null ? String(label) : '')

  const valueText =
    showPercent && percent != null ? `${value} (${percent}%)` : String(value)

  return (
    <div
      className="rounded-lg border border-[#3d2430] px-3 py-2 shadow-lg shadow-black/40"
      style={{ background: '#1a1215' }}
    >
      {displayName && (
        <p className="mb-1 text-xs font-medium text-white">{displayName}</p>
      )}
      <p className="text-sm text-white">
        <span className="text-pink-200/90">{countLabel}: </span>
        <span className="font-semibold">{valueText}</span>
      </p>
    </div>
  )
}
