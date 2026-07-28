import { Hero } from '@/components/sections/Hero'
import { TrustedClients } from '@/components/sections/TrustedClients'
import { ProductCategories } from '@/components/sections/ProductCategories'
import { Statistics } from '@/components/sections/Statistics'
import { Industries } from '@/components/sections/Industries'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { ProcessTimeline } from '@/components/sections/ProcessTimeline'
import { Testimonials } from '@/components/sections/Testimonials'
import { Faq } from '@/components/sections/Faq'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { useQuoteModal } from '@/hooks/useQuoteModal'
import { Seo } from '@/components/ui/Seo'

export function HomePage() {
  const { open } = useQuoteModal()

  return (
    <>
      <Seo
        title="Warehouse Storage Solutions Built For Performance"
        description="Al Surur General Store Equipment Trading LLC engineers and installs pallet racking, shelving, mezzanine floors and cantilever racks across the UAE. Based in Ajman, serving all Emirates."
        path="/"
      />
      <Hero onRequestQuote={open} />
      <TrustedClients />
      <ProductCategories />
      <Statistics />
      <Industries />
      <FeaturedProjects />
      <ProcessTimeline />
      <Testimonials />
      <Faq />
      <CtaBanner onRequestQuote={open} />
    </>
  )
}
