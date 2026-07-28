import { useTranslation } from 'react-i18next'

const clients = [
  'Emirates Logistics', 'Gulf Distribution', 'Al Ain Manufacturing', 'National Retail Group',
  'Dubai Trading Co.', 'Sharjah Industries', 'Union Warehousing', 'Falcon Freight',
]

export function TrustedClients() {
  const { t } = useTranslation()
  const loop = [...clients, ...clients]

  return (
    <section className="border-y border-navy/5 bg-white py-12">
      <div className="container-px mx-auto max-w-7xl">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray">
          {t('trustedClients.heading')}
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
        <div className="flex w-max animate-marquee gap-16">
          {loop.map((name, i) => (
            <span key={`${name}-${i}`} className="whitespace-nowrap font-display text-xl font-semibold text-navy/25">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
