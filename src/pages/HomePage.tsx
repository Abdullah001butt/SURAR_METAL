import { Suspense, lazy } from 'react'
import { Hero } from '@/components/sections/Hero'
import { TrustedClients } from '@/components/sections/TrustedClients'
import { ProductCategories } from '@/components/sections/ProductCategories'
import { Statistics } from '@/components/sections/Statistics'
import { Industries } from '@/components/sections/Industries'
import { CoverageMap } from '@/components/sections/CoverageMap'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { Testimonials } from '@/components/sections/Testimonials'
import { Faq } from '@/components/sections/Faq'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useTranslation } from 'react-i18next'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { Seo } from '@/components/ui/Seo'
import { faqItems } from '@/data/testimonials'

// Both sections below need the Supabase client (204KB) and/or react-hook-form
// + zod (98KB) — lazy-loading them keeps that weight out of the critical
// initial bundle instead of dragging it in for every visitor before they've
// even seen the hero. Neither is above-the-fold or part of the LCP path.
const BlogTeaser = lazy(() => import('@/components/sections/BlogTeaser').then((m) => ({ default: m.BlogTeaser })))
const LeadMagnet = lazy(() => import('@/components/sections/LeadMagnet').then((m) => ({ default: m.LeadMagnet })))

export function HomePage() {
  const { open } = useQuoteModal()
  const { t } = useTranslation()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: t(`faqData.${item.id}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`faqData.${item.id}.answer`),
      },
    })),
  }

  return (
    <>
      <Seo
        title="Warehouse Storage Solutions Ajman, UAE"
        description="Al Surur engineers and installs pallet racking, mezzanine floors, shelving and warehouse trolleys in Ajman & across the UAE. 18+ years, 500+ projects — request a free site survey."
        path="/"
        keywords="warehouse storage solutions Ajman, pallet racking Ajman, mezzanine floor Ajman, warehouse trolleys Ajman, shelving systems UAE, warehouse racking UAE"
        jsonLd={faqJsonLd}
      />
      <Hero onRequestQuote={open} />
      <TrustedClients />
      <ProductCategories />
      <Statistics />
      <Industries />
      <CoverageMap />
      <FeaturedProjects />
      <ProcessTimeline />
      <Suspense fallback={null}>
        <LeadMagnet />
      </Suspense>
      <Testimonials />
      <Suspense fallback={null}>
        <BlogTeaser />
      </Suspense>
      <Faq />
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
