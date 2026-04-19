import { useEffect, useMemo, useRef, useState } from 'react'

interface SlidingTitleProps {
  quotes: string[]
}

type Phase = 'in' | 'hold' | 'out' | 'wait'

const WORD_STAGGER_MS = 80
const WORD_DURATION_MS = 900
const HOLD_MS = 6500
const WAIT_MS = 1200
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
const BLUR_PX = 14
const OFFSET_Y = '70%'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function SlidingTitle({ quotes }: SlidingTitleProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('in')
  const [revealed, setRevealed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = useMemo(() => prefersReducedMotion(), [])

  const words = useMemo(
    () => (quotes[activeIndex] || '').split(/\s+/).filter(Boolean),
    [quotes, activeIndex],
  )

  const totalAnimMs = Math.max(0, words.length - 1) * WORD_STAGGER_MS + WORD_DURATION_MS

  // When entering a new quote, paint once with words off-screen,
  // then on next frame flip `revealed` so the transition fires.
  useEffect(() => {
    if (phase !== 'in') return
    setRevealed(false)
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealed(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [phase, activeIndex])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (reduceMotion) {
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
        nextDelay = totalAnimMs
        nextPhase = 'hold'
        break
      case 'hold':
        nextDelay = HOLD_MS
        nextPhase = 'out'
        break
      case 'out':
        nextDelay = totalAnimMs
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
  }, [phase, totalAnimMs, quotes.length, reduceMotion])

  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === 'hidden' && timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      } else if (document.visibilityState === 'visible' && !timerRef.current) {
        setPhase('in')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (reduceMotion) {
    return <span className="inline-block">{quotes[activeIndex] || ''}</span>
  }

  return (
    <span className="inline-flex flex-wrap justify-center gap-x-[0.3em] gap-y-1 leading-[1.15]">
      {words.map((word, i) => {
        // Reverse stagger order on out so the last word leaves first
        const staggerIndex = phase === 'out' ? words.length - 1 - i : i
        const delay = staggerIndex * WORD_STAGGER_MS

        let transform = 'translateY(0)'
        let filter = 'blur(0px)'
        let opacity = 1

        if (phase === 'in') {
          if (revealed) {
            transform = 'translateY(0)'
            filter = 'blur(0px)'
            opacity = 1
          } else {
            // Pre-reveal: words start below, blurred (entry from bottom)
            transform = `translateY(${OFFSET_Y})`
            filter = `blur(${BLUR_PX}px)`
            opacity = 0
          }
        } else if (phase === 'hold') {
          transform = 'translateY(0)'
          filter = 'blur(0px)'
          opacity = 1
        } else {
          // out | wait — scroll upward past the line, blurred
          transform = `translateY(-${OFFSET_Y})`
          filter = `blur(${BLUR_PX}px)`
          opacity = 0
        }

        return (
          <span
            key={`${activeIndex}-${i}`}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.18em' }}
          >
            <span
              className="inline-block"
              style={{
                transform,
                filter,
                opacity,
                transition: `transform ${WORD_DURATION_MS}ms ${EASING} ${delay}ms, filter ${WORD_DURATION_MS}ms ${EASING} ${delay}ms, opacity ${WORD_DURATION_MS}ms ${EASING} ${delay}ms`,
                willChange: 'transform, filter, opacity',
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
