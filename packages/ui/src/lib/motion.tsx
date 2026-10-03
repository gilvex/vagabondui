'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
export const transitions = {
  spring: { type: 'spring' as const, stiffness: 380, damping: 30 },
  entrance: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
}
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        ...transitions.entrance,
        duration: reduced ? 0 : 0.5,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  )
}
