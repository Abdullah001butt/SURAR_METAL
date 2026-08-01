import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { QuoteModal } from '@/components/ui/QuoteModal'
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp'
import { BackToTop } from '@/components/ui/BackToTop'
import { StickyMobileCta } from '@/components/ui/StickyMobileCta'
import { QuoteModalContext } from '@/hooks/useQuoteModal'
import { useExitIntent } from '@/hooks/useExitIntent'
import { useLenis } from '@/hooks/useLenis'

const EXIT_INTENT_KEY = 'al-surur-exit-intent-shown'

export function Layout() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [exitIntentOpen, setExitIntentOpen] = useState(false)
  useLenis()

  const triggerExitIntent = useCallback(() => {
    if (sessionStorage.getItem(EXIT_INTENT_KEY)) return
    sessionStorage.setItem(EXIT_INTENT_KEY, '1')
    setExitIntentOpen(true)
  }, [])

  useExitIntent({
    onTrigger: triggerExitIntent,
    enabled: !quoteOpen && !exitIntentOpen,
  })

  return (
    <QuoteModalContext.Provider value={{ open: () => setQuoteOpen(true) }}>
      <Navbar onRequestQuote={() => setQuoteOpen(true)} />
      <main className="pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
      <QuoteModal open={exitIntentOpen} onClose={() => setExitIntentOpen(false)} variant="exit-intent" />
      <FloatingWhatsApp />
      <BackToTop />
      <StickyMobileCta onRequestQuote={() => setQuoteOpen(true)} />
    </QuoteModalContext.Provider>
  )
}
