import { useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GsapStagger } from '@/components/ui/GsapStagger'
import { faqItems } from '@/data/testimonials'
import { gsap } from '@/lib/gsap'
import { cn } from '@/utils/cn'

function FaqItem({ isOpen, onToggle, question, answer }: { isOpen: boolean; onToggle: () => void; question: string; answer: string }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (!body) return

    if (!mounted.current) {
      gsap.set(body, { height: isOpen ? 'auto' : 0 })
      mounted.current = true
      return
    }

    if (isOpen) {
      gsap.set(body, { height: 'auto' })
      gsap.from(body, { height: 0, duration: 0.35, ease: 'power2.inOut' })
    } else {
      gsap.to(body, { height: 0, duration: 0.3, ease: 'power2.inOut' })
    }
  }, [isOpen])

  return (
    <div className="rounded-2xl bg-white ring-1 ring-navy/5">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
      >
        <span className="font-display text-base font-semibold text-navy">{question}</span>
        <span
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform',
            isOpen && 'rotate-45',
          )}
        >
          <Plus size={16} />
        </span>
      </button>
      <div ref={bodyRef} className="overflow-hidden">
        <p className="px-6 pb-5 text-sm leading-relaxed text-gray">{answer}</p>
      </div>
    </div>
  )
}

export function Faq() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<string | null>(faqItems[0].id)

  return (
    <section className="bg-bg py-24 lg:py-32">
      <div className="container-px mx-auto max-w-4xl">
        <SectionTitle eyebrow={t('faq.eyebrow')} title={t('faq.title')} align="center" />

        <GsapStagger className="mt-14 space-y-3" stagger={0.05} y={16}>
          {faqItems.map((item) => (
            <FaqItem
              key={item.id}
              isOpen={open === item.id}
              onToggle={() => setOpen(open === item.id ? null : item.id)}
              question={t(`faqData.${item.id}.question`)}
              answer={t(`faqData.${item.id}.answer`)}
            />
          ))}
        </GsapStagger>
      </div>
    </section>
  )
}
