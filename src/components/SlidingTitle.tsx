import { useEffect, useMemo, useRef, useState } from 'react'

interface SlidingTitleProps {
  quotes: string[]
}

type Phase = 'in' | 'hold' | 'out' | 'wait'

const WORD_STAGGER_MS = 60
const WORD_DURATION_MS = 700
const HOLD_MS = 4000
const WAIT_MS = 5000
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function SlidingTitle({ quotes }: SlidingTitleProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('in')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = useMemo(() => prefersReducedMotion(), [])

  const words = useMemo(
    () => (quotes[activeIndex] || '').split(/\s+/).filter(Boolean),
    [quotes, activeIndex],
  )

  const totalRevealMs = words.length * WORD_STAGGER_MS + WORD_DURATION_MS

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (reduceMotion) {
      // Static display, swap every HOLD + WAIT
      timerRef.current = setTimeout(() => {
        setActiveIndex((i) => (i + 1) % quotes.length)
      }, HOLD_MS + WAIT_MS)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }

    let nextDelay = 0
    let nextPhase: Phase = phase

    switch (phase) {
      case 'in':
        nextDelay = totalRevealMs
        nextPhase = 'hold'
        break
      case 'hold':
        nextDelay = HOLD_MS
        nextPhase = 'out'
        break
      case 'out':
        nextDelay = totalRevealMs
        nextPhase = 'wait'
        break
      case 'wait':
        nextDelay = WAIT_MS
        nextPhase = 'in'
        break
    }

    timerRef.current = setTimeout(() => {
      if (phase === 'wait') {
        setActiveIndex((i) => (i + 1) % quotes.length)
        setPhase('in')
      } else {
        setPhase(nextPhase)
      }
    }, nextDelay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [phase, totalRevealMs, quotes.length, reduceMotion])

  // Pause cycling when tab is hidden — resumes naturally when state updates again
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden' && timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      } else if (document.visibilityState === 'visible' && !timerRef.current) {
        // Re-trigger phase effect by resetting to 'in' on the current quote
        setPhase('in')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (reduceMotion) {
    return (
      <span className="inline-block">{quotes[activeIndex] || ''}</span>
    )
  }

  return (
    <span className="inline-flex flex-wrap justify-center gap-x-[0.3em] gap-y-1 leading-[1.15]">
      {words.map((word, i) => {
        // Reverse stagger order on 'out' so the last word leaves first (mirror of entry)
        const staggerIndex =
          phase === 'out' ? words.length - 1 - i : i
        const delay = staggerIndex * WORD_STAGGER_MS
        const visible = phase === 'in' || phase === 'hold'

        return (
          <span
            key={`${activeIndex}-${i}`}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.12em' }}
          >
            <span
              className="inline-block"
              style={{
                transform: visible ? 'translateY(0%)' : 'translateY(110%)',
                opacity: visible ? 1 : 0,
                transition: `transform ${WORD_DURATION_MS}ms ${EASING} ${delay}ms, opacity ${WORD_DURATION_MS}ms ${EASING} ${delay}ms`,
                willChange: 'transform, opacity',
              }}
            >
              {word}
            </span>
          </span>
        )
      })}
    </span>
  )
}
