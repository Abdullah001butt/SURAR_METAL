import type { ProductCategory } from '@/types'
import palletRackingImg from '@/assets/images/pallet-racking.jpg'
import shelvingSystemsImg from '@/assets/images/shelving-systems.jpg'
import mezzanineFloorsImg from '@/assets/images/mezzanine-floors.jpg'
import cantileverRacksImg from '@/assets/images/cantilever-racks.jpg'
import industrialLockersImg from '@/assets/images/shelving-alt.jpg'
import warehouseTrolleysImg from '@/assets/images/warehouse-trolleys.jpg'

export const productCategories: ProductCategory[] = [
  { id: 'pallet-racking', image: palletRackingImg, href: '/products/pallet-racking' },
  { id: 'shelving-systems', image: shelvingSystemsImg, href: '/products/shelving-systems' },
  { id: 'mezzanine-floors', image: mezzanineFloorsImg, href: '/products/mezzanine-floors' },
  { id: 'cantilever-racks', image: cantileverRacksImg, href: '/products/cantilever-racks' },
  { id: 'industrial-lockers', image: industrialLockersImg, href: '/products/industrial-lockers' },
  { id: 'warehouse-trolleys', image: warehouseTrolleysImg, href: '/products/warehouse-trolleys' },
]
