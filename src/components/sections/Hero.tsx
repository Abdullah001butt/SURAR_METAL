import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShieldCheck, Award, Truck, Factory } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RevealHeading } from '@/components/ui/RevealHeading'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { gsap } from '@/lib/gsap'
import heroImg from '@/assets/images/warehouse-hero.jpg'

const floatingCards = [
  { icon: Award, key: 'experience' },
  { icon: ShieldCheck, key: 'projects' },
  { icon: Truck, key: 'installation' },
  { icon: Factory, key: 'quality' },
]

interface HeroProps {
  onRequestQuote: () => void
}

export function Hero({ onRequestQuote }: HeroProps) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Parallax background scrubbed to scroll
      gsap.fromTo(
        bgRef.current,
        { yPercent: 0, scale: 1.08 },
        {
          yPercent: 22,
          scale: 1.22,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.5 },
        },
      )
      gsap.fromTo(
        contentRef.current,
        { yPercent: 0, opacity: 1 },
        {
          yPercent: 18,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: '80% top', scrub: 0.5 },
        },
      )

      // Entrance timeline
      const tl = gsap.timeline({ delay: 0.1 })
      tl.fromTo(badgeRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
        .fromTo(descRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
        .fromTo(ctaRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')

      if (cardsRef.current) {
        const cards = gsap.utils.toArray<HTMLElement>('.hero-float-card', cardsRef.current)
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, delay: 0.5, ease: 'back.out(1.6)' },
        )
        cards.forEach((card) => {
          card.addEventListener('mouseenter', () => gsap.to(card, { y: -6, duration: 0.3, ease: 'power2.out' }))
          card.addEventListener('mouseleave', () => gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' }))
        })
      }

      gsap.fromTo(scrollHintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1 })
      gsap.to(dotRef.current, { y: 12, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-20">
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />

      <div
        ref={contentRef}
        className="container-px relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
      >
        <div>
          <span
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            {t('hero.badge')}
          </span>

          <RevealHeading
            as="h1"
            delay={0.35}
            className="mt-6 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
          >
            {t('hero.titleLine1')}
            <br />
            {t('hero.titleLine2')} <span className="text-gradient">{t('hero.titleHighlight')}</span>
          </RevealHeading>

          <p ref={descRef} className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            {t('hero.description')}
          </p>

          <div ref={ctaRef} className="mt-9 flex flex-wrap gap-4">
            <MagneticButton className="inline-block">
              <Button size="lg" icon={<ArrowRight size={18} className="rtl:rotate-180" />} onClick={onRequestQuote}>
                {t('hero.ctaPrimary')}
              </Button>
            </MagneticButton>
            <Link to="/products">
              <Button variant="outline-light" size="lg" icon={<ChevronRight size={18} className="rtl:rotate-180" />}>
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div ref={cardsRef} className="grid grid-cols-2 gap-4">
            {floatingCards.map((card, i) => (
              <div key={card.key} className={`hero-float-card glass rounded-2xl p-6 ${i % 2 === 1 ? 'mt-8' : ''}`}>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-primary">
                  <card.icon size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug text-white">{t(`hero.cards.${card.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={scrollHintRef} className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 opacity-0">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <div ref={dotRef} className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </div>
    </section>
  )
}
