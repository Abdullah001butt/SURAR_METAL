import { lazy, Suspense, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShieldCheck, Award, Truck, Factory } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WordReveal } from '@/components/ui/WordReveal'
import { TypingText } from '@/components/ui/TypingText'
import { Magnetic } from '@/components/ui/Magnetic'

// Served from /public (not a Vite-hashed import) so these match the exact
// URLs preloaded in index.html's <link rel="preload"> — see the comment
// there for why. Two sizes so mobile devices (the majority of traffic)
// don't download a full 1920px desktop image for a ~412px-wide viewport.
const heroImg = '/hero-bg.webp'
const heroImgMobile = '/hero-bg-mobile.webp'

// Three.js is a heavy chunk (~150KB+) — load it only for the visitors who'll
// actually see it (desktop, via the lg:block wrapper below), never blocking
// the initial page render or shipping to mobile visitors.
const RackingScene = lazy(() => import('@/components/ui/RackingScene').then((m) => ({ default: m.RackingScene })))

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
  const titleLine1 = t('hero.titleLine1')
  const titleLine2 = t('hero.titleLine2')
  const titleHighlight = t('hero.titleHighlight')
  const line2Delay = 0.1 + titleLine1.split(' ').length * 0.08
  const highlightDelay = line2Delay + titleLine2.split(' ').length * 0.08
  const typingWords = t('hero.typingWords', { returnObjects: true }) as string[]
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={sectionRef} className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-20">
      <motion.img
        src={heroImg}
        srcSet={`${heroImgMobile} 900w, ${heroImg} 1920w`}
        sizes="100vw"
        alt=""
        fetchPriority="high"
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover opacity-55 contrast-[1.08] saturate-[0.85]"
        style={{ y: bgY, scale: bgScale }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/55 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.5),transparent_65%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/10 to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-px relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
      >
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
          >
            {t('hero.badge')}
          </motion.span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            <WordReveal text={titleLine1} delay={0.1} />
            <br />
            <WordReveal text={titleLine2} delay={line2Delay} />{' '}
            <WordReveal text={titleHighlight} delay={highlightDelay} wordClassName="text-gradient" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            {t('hero.description')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-5 flex items-center gap-2 text-sm text-white/50"
          >
            <span>{t('hero.typingPrefix')}</span>
            <TypingText words={typingWords} className="font-display text-base font-semibold text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Magnetic className="inline-block">
              <Button size="lg" icon={<ArrowRight size={18} className="rtl:rotate-180" />} onClick={onRequestQuote}>
                {t('hero.ctaPrimary')}
              </Button>
            </Magnetic>
            <Link to="/products">
              <Button variant="outline-light" size="lg" icon={<ChevronRight size={18} className="rtl:rotate-180" />}>
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="relative hidden lg:block">
          <Suspense fallback={null}>
            <RackingScene className="pointer-events-none absolute -inset-24 -z-10 opacity-80" />
          </Suspense>
          <div className="grid grid-cols-2 gap-4">
            {floatingCards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ y: -6 }}
                className={`glass rounded-2xl p-6 ${i % 2 === 1 ? 'mt-8' : ''}`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/20 text-primary">
                  <card.icon size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold leading-snug text-white">{t(`hero.cards.${card.key}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="h-1.5 w-1.5 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  )
}
