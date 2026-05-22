import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: string
  delay?: number
  accent?: string
}

export function StatCard({
  label,
  value,
  sub,
  delay = 0,
  accent = 'from-pink-600 to-rose-500',
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass relative overflow-hidden rounded-xl p-3 sm:rounded-2xl sm:p-5"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${accent}`} />
      <p className="text-[11px] text-pink-300/80 sm:text-sm">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white sm:mt-2 sm:text-3xl">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-pink-400/60 sm:mt-1 sm:text-xs">{sub}</p>}
    </motion.div>
  )
}
