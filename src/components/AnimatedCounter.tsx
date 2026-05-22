import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  decimals?: number
  suffix?: string
}

export function AnimatedCounter({ value, decimals = 0, suffix = '' }: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 })
  const display = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString(),
  )
  const [text, setText] = useState('0')

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => {
    return display.on('change', (v) => setText(v))
  }, [display])

  return (
    <motion.span className="tabular-nums">
      {text}
      {suffix}
    </motion.span>
  )
}
