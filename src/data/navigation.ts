import type { NavLink } from '@/types'

export const navLinks: NavLink[] = [
  {
    labelKey: 'nav.products',
    href: '/products',
    megaMenu: [
      {
        headingKey: 'nav.megaProducts.racking',
        items: [
          { labelKey: 'productsData.pallet-racking.title', href: '/products/pallet-racking' },
          { labelKey: 'productsData.cantilever-racks.title', href: '/products/cantilever-racks' },
          { labelKey: 'productsData.mezzanine-floors.title', href: '/products/mezzanine-floors' },
        ],
      },
      {
        headingKey: 'nav.megaProducts.storage',
        items: [
          { labelKey: 'productsData.shelving-systems.title', href: '/products/shelving-systems' },
          { labelKey: 'productsData.industrial-lockers.title', href: '/products/industrial-lockers' },
          { labelKey: 'productsData.warehouse-trolleys.title', href: '/products/warehouse-trolleys' },
        ],
      },
    ],
  },
  {
    labelKey: 'nav.industries',
    href: '/industries',
    megaMenu: [
      {
        headingKey: 'nav.megaIndustries.weServe',
        items: [
          { labelKey: 'industriesData.warehousing', href: '/industries#warehousing' },
          { labelKey: 'industriesData.retail', href: '/industries#retail' },
          { labelKey: 'industriesData.manufacturing', href: '/industries#manufacturing' },
          { labelKey: 'industriesData.logistics', href: '/industries#logistics' },
        ],
      },
      {
        headingKey: 'nav.megaIndustries.specialized',
        items: [
          { labelKey: 'industriesData.healthcare', href: '/industries#healthcare' },
          { labelKey: 'industriesData.food', href: '/industries#food' },
          { labelKey: 'industriesData.automotive', href: '/industries#automotive' },
        ],
      },
    ],
  },
  { labelKey: 'nav.projects', href: '/projects' },
  { labelKey: 'nav.about', href: '/about' },
  { labelKey: 'nav.blog', href: '/blog' },
  { labelKey: 'nav.contact', href: '/contact' },
]
