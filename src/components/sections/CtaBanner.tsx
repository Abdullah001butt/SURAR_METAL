import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { RevealHeading } from '@/components/ui/RevealHeading'
import { FadeIn } from '@/components/ui/FadeIn'

interface CtaBannerProps {
  onRequestQuote: () => void
}

export function CtaBanner({ onRequestQuote }: CtaBannerProps) {
  const { t } = useTranslation()

  return (
    <section className="container-px mx-auto max-w-7xl py-20">
      <FadeIn
        y={30}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-navy-light px-8 py-16 text-center sm:px-16"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,90,31,0.25),transparent_60%)]" />
        <div className="relative">
          <RevealHeading className="mx-auto max-w-2xl font-display text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
            {t('ctaBanner.title')}
          </RevealHeading>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            {t('ctaBanner.description')}
          </p>
          <MagneticButton className="mt-8 inline-block">
            <Button size="lg" icon={<ArrowRight size={18} className="rtl:rotate-180" />} onClick={onRequestQuote}>
              {t('ctaBanner.button')}
            </Button>
          </MagneticButton>
        </div>
      </FadeIn>
    </section>
  )
}
