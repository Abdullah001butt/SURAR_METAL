import { useState } from 'react'
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Menu, X } from 'lucide-react'
import { navLinks } from '@/data/navigation'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { cn } from '@/utils/cn'
import { useScrollPast } from '@/hooks/useScrollPast'
import logo from '@/assets/logo.png'

interface NavbarProps {
  onRequestQuote: () => void
}

export function Navbar({ onRequestQuote }: NavbarProps) {
  const { t } = useTranslation()
  const scrolled = useScrollPast(24)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'bg-navy/80 backdrop-blur-xl shadow-lg shadow-black/10' : 'bg-transparent',
      )}
    >
      <nav className="container-px mx-auto flex h-20 max-w-7xl items-center justify-between">
        <Link to="/" className="flex shrink-0 items-center rounded-xl bg-white/95 px-3 py-2 shadow-sm">
          <img src={logo} alt="Al Surur General Store Equipment Trading LLC" className="h-8 w-auto sm:h-9" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <div
              key={link.labelKey}
              className="relative"
              onMouseEnter={() => link.megaMenu && setOpenMenu(link.labelKey)}
              onMouseLeave={() => link.megaMenu && setOpenMenu(null)}
            >
              <RouterNavLink
                to={link.href}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
              >
                {t(link.labelKey)}
                {link.megaMenu && <ChevronDown size={14} className={cn('transition-transform', openMenu === link.labelKey && 'rotate-180')} />}
              </RouterNavLink>

              <AnimatePresence>
                {link.megaMenu && openMenu === link.labelKey && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute start-1/2 top-full w-[560px] -translate-x-1/2 pt-4 rtl:translate-x-1/2"
                  >
                    <div className="glass rounded-2xl bg-navy/95 p-6 shadow-2xl">
                      <div className="grid grid-cols-2 gap-6">
                        {link.megaMenu.map((col) => (
                          <div key={col.headingKey}>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{t(col.headingKey)}</p>
                            <ul className="space-y-3">
                              {col.items.map((item) => (
                                <li key={item.labelKey}>
                                  <Link to={item.href} className="block group">
                                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                                      {t(item.labelKey)}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden md:block">
            <Button variant="primary" size="md" onClick={onRequestQuote}>
              {t('nav.requestQuote')}
            </Button>
          </div>
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-white lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy lg:hidden"
          >
            <div className="container-px flex h-20 items-center justify-between">
              <span className="font-display text-lg font-semibold text-white">Menu</span>
              <button
                className="grid h-10 w-10 place-items-center rounded-full text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <div className="container-px flex flex-col gap-2 pb-10">
              {navLinks.map((link) => (
                <div key={link.labelKey} className="border-b border-white/10 py-4">
                  <Link to={link.href} onClick={() => setMobileOpen(false)} className="text-lg font-medium text-white">
                    {t(link.labelKey)}
                  </Link>
                  {link.megaMenu && (
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      {link.megaMenu.map((col) => (
                        <div key={col.headingKey}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">{t(col.headingKey)}</p>
                          <ul className="space-y-2">
                            {col.items.map((item) => (
                              <li key={item.labelKey}>
                                <Link
                                  to={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="text-sm text-white/70"
                                >
                                  {t(item.labelKey)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                onClick={() => {
                  setMobileOpen(false)
                  onRequestQuote()
                }}
              >
                {t('nav.requestQuote')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
