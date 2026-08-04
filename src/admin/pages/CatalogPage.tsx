import { useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { exportElementsToPdf } from '@/admin/utils/pdfExport'
import logo from '@/assets/logo.png'

import cantileverRacking from '@/assets/images/cantilever-racks.jpg'
import steelPallet from '@/assets/images/catalog/steel-pallet.jpg'
import mobilePalletRacking from '@/assets/images/catalog/mobile-pallet-racking.jpg'
import longSpanRacking from '@/assets/images/catalog/long-span-racking.jpg'
import modularMezzanine from '@/assets/images/catalog/modular-mezzanine.jpg'
import supermarketShelf from '@/assets/images/catalog/supermarket-shelf.jpg'
import narrowAisleRacking from '@/assets/images/catalog/narrow-aisle-racking.jpg'
import galvanizedGrating from '@/assets/images/catalog/galvanized-grating.jpg'
import plasticPallet from '@/assets/images/catalog/plastic-pallet.jpg'
import mezzanineFloor from '@/assets/images/catalog/mezzanine-floor.jpg'
import epoxyFloor from '@/assets/images/catalog/epoxy-floor.jpg'
import plasticBin from '@/assets/images/catalog/plastic-bin.jpg'

interface CatalogItem {
  title: string
  image: string
}

const catalogItems: CatalogItem[] = [
  { title: 'Cantilever Racking', image: cantileverRacking },
  { title: 'Steel Pallet', image: steelPallet },
  { title: 'Mobile Pallet Racking', image: mobilePalletRacking },
  { title: 'Long Span Racking', image: longSpanRacking },
  { title: 'Modular Mezzanine', image: modularMezzanine },
  { title: 'Supermarket Shelf', image: supermarketShelf },
  { title: 'Narrow Aisle Racking', image: narrowAisleRacking },
  { title: 'Galvanized Grating', image: galvanizedGrating },
  { title: 'Plastic Pallet', image: plasticPallet },
  { title: 'Mezzanine Floor', image: mezzanineFloor },
  { title: 'Epoxy Floor Painting', image: epoxyFloor },
  { title: 'Plastic Bin', image: plasticBin },
]

const services = [
  'Selective Pallet Racking', 'Drive-In Racking', 'Modular Mezzanines', 'System Shelving',
  'Mobile Shelving', 'Conveyors', 'Supermarket Shelving', 'Gypsum Partition',
  'Plastic Pallet', 'Steel Pallet', 'Pallet Jack', 'Professional Rack Fixing',
]

function CategoryCard({ item }: { item: CatalogItem }) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-[rgba(0,0,0,0.1)]">
      <div className="h-32 w-full overflow-hidden bg-[#e8ecf3]">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover" crossOrigin="anonymous" />
      </div>
      <div className="bg-[#dc2626] py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-white">
        {item.title}
      </div>
    </div>
  )
}

function CatalogPageSheet({ items }: { items: CatalogItem[] }) {
  return (
    <div className="mx-auto w-[210mm] bg-white" dir="ltr">
      <div className="flex items-center justify-between bg-[#fbbf24] px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Al Surur" className="h-14 w-auto rounded bg-white p-1" crossOrigin="anonymous" />
          <div>
            <p className="font-display text-2xl font-extrabold leading-none text-[#dc2626]">AL SURUR</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1f2937]">General Store Equipment Trading LLC</p>
          </div>
        </div>
        <div className="rounded-md bg-[#dc2626] px-4 py-2 text-end">
          <p className="text-xs font-bold uppercase tracking-widest text-white">Our Services</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-[#fbbf24] px-6 pb-4 text-[11px] font-semibold text-[#1f2937]">
        {services.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="text-[#dc2626]">■</span> {s}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 bg-[#1e3a8a] p-6">
        {items.map((item) => (
          <CategoryCard key={item.title} item={item} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 bg-[#dc2626] py-3 text-xs font-semibold text-white">
        <span>Mob.: 050 206 9782, 050 345 3231</span>
        <span>E-mail: alsurur108@gmail.com</span>
        <span>Ajman - U.A.E</span>
      </div>
    </div>
  )
}

export function CatalogPage() {
  const page1Ref = useRef<HTMLDivElement>(null)
  const page2Ref = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const firstHalf = catalogItems.slice(0, 6)
  const secondHalf = catalogItems.slice(6, 12)

  const handleDownload = async () => {
    if (!page1Ref.current || !page2Ref.current) return
    setDownloading(true)
    try {
      await exportElementsToPdf([page1Ref.current, page2Ref.current], 'Al-Surur-Product-Catalog')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Product Catalog</h1>
          <p className="mt-1 text-sm text-gray">Professional printable brochure of all racking and storage systems.</p>
        </div>
        <Button onClick={handleDownload} disabled={downloading} icon={<Download size={16} />}>
          {downloading ? 'Generating...' : 'Download Catalog PDF'}
        </Button>
      </div>

      <div className="mt-6 space-y-8 overflow-x-auto rounded-2xl bg-bg p-6">
        <div ref={page1Ref}>
          <CatalogPageSheet items={firstHalf} />
        </div>
        <div ref={page2Ref}>
          <CatalogPageSheet items={secondHalf} />
        </div>
      </div>
    </div>
  )
}
