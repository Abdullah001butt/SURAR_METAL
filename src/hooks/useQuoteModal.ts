import { createContext, useContext } from 'react'

interface QuoteModalContextValue {
  open: () => void
}

export const QuoteModalContext = createContext<QuoteModalContextValue | null>(null)

export function useQuoteModal() {
  const ctx = useContext(QuoteModalContext)
  if (!ctx) throw new Error('useQuoteModal must be used within Layout')
  return ctx
}
