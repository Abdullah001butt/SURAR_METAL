import type { ProductCategory } from '@/types'
import palletRackingImg from '@/assets/images/pallet-racking.webp'
import shelvingSystemsImg from '@/assets/images/shelving-systems.webp'
import mezzanineFloorsImg from '@/assets/images/mezzanine-floors.webp'
import cantileverRacksImg from '@/assets/images/cantilever-racks.webp'
import industrialLockersImg from '@/assets/images/shelving-alt.webp'
import warehouseTrolleysImg from '@/assets/images/warehouse-trolleys.webp'

export const productCategories: ProductCategory[] = [
  { id: 'pallet-racking', image: palletRackingImg, href: '/products/pallet-racking' },
  { id: 'shelving-systems', image: shelvingSystemsImg, href: '/products/shelving-systems' },
  { id: 'mezzanine-floors', image: mezzanineFloorsImg, href: '/products/mezzanine-floors' },
  { id: 'cantilever-racks', image: cantileverRacksImg, href: '/products/cantilever-racks' },
  { id: 'industrial-lockers', image: industrialLockersImg, href: '/products/industrial-lockers' },
  { id: 'warehouse-trolleys', image: warehouseTrolleysImg, href: '/products/warehouse-trolleys' },
]
