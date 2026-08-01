import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { supportedLanguages } from '@/i18n'
import { cn } from '@/utils/cn'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  const current = supportedLanguages.find((l) => l.code === i18n.resolvedLanguage) ?? supportedLanguages[0]

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
        aria-label="Change language"
      >
        <Globe size={16} />
        <span className="hidden sm:inline">{current.nativeLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 top-full w-40 pt-3"
          >
            <div className="overflow-hidden rounded-2xl bg-navy/95 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2.5 text-start text-sm transition-colors hover:bg-white/10',
                    lang.code === current.code ? 'text-primary' : 'text-white/80',
                  )}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
