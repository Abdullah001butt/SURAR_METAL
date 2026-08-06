import type { Project } from '@/types'
import heroImg from '@/assets/images/warehouse-hero.webp'
import palletRackingImg from '@/assets/images/pallet-racking.webp'
import shelvingSystemsImg from '@/assets/images/shelving-systems.webp'
import mezzanineFloorsImg from '@/assets/images/mezzanine-floors.webp'
import cantileverRacksImg from '@/assets/images/cantilever-racks.webp'
import shelvingAltImg from '@/assets/images/shelving-alt.webp'

export const projects: Project[] = [
  { id: 'p1', image: heroImg, size: 'large' },
  { id: 'p2', image: shelvingSystemsImg, size: 'small' },
  { id: 'p3', image: mezzanineFloorsImg, size: 'small' },
  { id: 'p4', image: cantileverRacksImg, size: 'large' },
  { id: 'p5', image: palletRackingImg, size: 'small' },
  { id: 'p6', image: shelvingAltImg, size: 'small' },
]
