import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  light?: boolean
}

export function Breadcrumb({ items, light = false }: BreadcrumbProps) {
  const { t } = useTranslation()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('nav.home', { defaultValue: 'Home' }), item: typeof window !== 'undefined' ? window.location.origin : '' },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.label,
        ...(item.href && typeof window !== 'undefined' ? { item: `${window.location.origin}${item.href}` } : {}),
      })),
    ],
  }

  return (
    <nav aria-label="Breadcrumb" className="flex justify-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className={`flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium ${light ? 'text-white/60' : 'text-gray'}`}>
        <li className="flex items-center gap-1.5">
          <Link to="/" className={`flex items-center gap-1 transition-colors ${light ? 'hover:text-white' : 'hover:text-primary'}`}>
            <Home size={12} />
            {t('nav.home', { defaultValue: 'Home' })}
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="rtl:rotate-180" />
            {item.href ? (
              <Link to={item.href} className={`transition-colors ${light ? 'hover:text-white' : 'hover:text-primary'}`}>
                {item.label}
              </Link>
            ) : (
              <span className={light ? 'text-white' : 'text-navy'} aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
