import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useIsMobile } from '../hooks/useMediaQuery'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  delay?: number
  tall?: boolean
  /** Chart sets its own height (horizontal bar lists) */
  autoHeight?: boolean
  className?: string
}

export function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
  tall,
  autoHeight,
  className = '',
}: ChartCardProps) {
  const isMobile = useIsMobile()
  const minHeight = tall ? (isMobile ? 300 : 320) : isMobile ? 240 : 260

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.55 }}
      className={`glass rounded-2xl p-3 sm:p-5 ${className}`}
    >
      <h3 className="text-sm font-semibold text-pink-50 sm:text-base">{title}</h3>
      {subtitle && <p className="mb-2 text-[11px] text-pink-300/60 sm:mb-3 sm:text-xs">{subtitle}</p>}
      <div
        className="w-full"
        style={autoHeight ? { minHeight } : { height: minHeight }}
      >
        {children}
      </div>
    </motion.div>
  )
}
