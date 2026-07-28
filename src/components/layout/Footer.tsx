import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { productCategories } from '@/data/products'
import { FacebookIcon, InstagramIcon, LinkedinIcon } from '@/components/ui/SocialIcons'
import logo from '@/assets/logo.png'

const socials = [
  { icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
  { icon: InstagramIcon, href: 'https://instagram.com', label: 'Instagram' },
  { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-navy text-white">
      <div className="container-px mx-auto max-w-7xl py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center rounded-xl bg-white/95 px-3 py-2">
              <img src={logo} alt="Al Surur General Store Equipment Trading LLC" className="h-9 w-auto" />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {t('footer.description')}
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/70 transition-colors hover:bg-primary hover:text-white"
                >
                  <s.icon width={18} height={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">{t('footer.company')}</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-primary">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/projects" className="hover:text-primary">{t('footer.projects')}</Link></li>
              <li><Link to="/blog" className="hover:text-primary">{t('footer.blog')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary">{t('footer.contactLink')}</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">{t('footer.products')}</p>
            <ul className="space-y-3 text-sm text-white/70">
              {productCategories.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <Link to={p.href} className="hover:text-primary">{t(`productsData.${p.id}.title`)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">{t('footer.contact')}</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                Industrial Area, Ajman, UAE
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary" />
                <a href="tel:+971554939866" className="hover:text-primary" dir="ltr">+971 55 493 9866</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary" />
                <a href="tel:+971502069782" className="hover:text-primary" dir="ltr">+971 50 206 9782</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-primary" />
                <a href="mailto:info@alsururmetal.com" className="hover:text-primary" dir="ltr">info@alsururmetal.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title="Al Surur Location Map"
            src="https://www.google.com/maps?q=Ajman,UAE&output=embed"
            className="h-56 w-full grayscale invert-[0.92] contrast-[1.1]"
            loading="lazy"
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>© {new Date().getFullYear()} Al Surur General Store Equipment Trading LLC. {t('footer.rights')}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white/70">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white/70">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
