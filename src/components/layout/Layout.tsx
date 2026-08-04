import { lazy, Suspense, useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingWhatsApp } from '@/components/ui/FloatingWhatsApp'
import { BackToTop } from '@/components/ui/BackToTop'
import { StickyMobileCta } from '@/components/ui/StickyMobileCta'
import { QuoteModalContext } from '@/hooks/useQuoteModal'
import { useExitIntent } from '@/hooks/useExitIntent'

// react-hook-form + zod only need to load once someone actually opens the quote form,
// not on every page's initial load.
const QuoteModal = lazy(() => import('@/components/ui/QuoteModal').then((m) => ({ default: m.QuoteModal })))

const EXIT_INTENT_KEY = 'al-surur-exit-intent-shown'

export function Layout() {
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [exitIntentOpen, setExitIntentOpen] = useState(false)
  // Once true, stays true — keeps the modal mounted for its own close animation
  // instead of yanking it out mid-fade the instant `open` flips back to false.
  const [everOpened, setEverOpened] = useState(false)

  const openQuote = useCallback(() => {
    setEverOpened(true)
    setQuoteOpen(true)
  }, [])

  const triggerExitIntent = useCallback(() => {
    if (sessionStorage.getItem(EXIT_INTENT_KEY)) return
    sessionStorage.setItem(EXIT_INTENT_KEY, '1')
    setEverOpened(true)
    setExitIntentOpen(true)
  }, [])

  useExitIntent({
    onTrigger: triggerExitIntent,
    enabled: !quoteOpen && !exitIntentOpen,
  })

  return (
    <QuoteModalContext.Provider value={{ open: openQuote }}>
      <Navbar onRequestQuote={openQuote} />
      <main className="pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      {everOpened && (
        <Suspense fallback={null}>
          <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
          <QuoteModal open={exitIntentOpen} onClose={() => setExitIntentOpen(false)} variant="exit-intent" />
        </Suspense>
      )}
      <FloatingWhatsApp />
      <BackToTop />
      <StickyMobileCta onRequestQuote={openQuote} />
    </QuoteModalContext.Provider>
  )
}
