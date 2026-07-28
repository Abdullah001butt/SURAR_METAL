import type { Project } from '@/types'
import heroImg from '@/assets/images/warehouse-hero.jpg'
import palletRackingImg from '@/assets/images/pallet-racking.jpg'
import shelvingSystemsImg from '@/assets/images/shelving-systems.jpg'
import mezzanineFloorsImg from '@/assets/images/mezzanine-floors.jpg'
import cantileverRacksImg from '@/assets/images/cantilever-racks.jpg'
import shelvingAltImg from '@/assets/images/shelving-alt.jpg'

export const projects: Project[] = [
  { id: 'p1', image: heroImg, size: 'large' },
  { id: 'p2', image: shelvingSystemsImg, size: 'small' },
  { id: 'p3', image: mezzanineFloorsImg, size: 'small' },
  { id: 'p4', image: cantileverRacksImg, size: 'large' },
  { id: 'p5', image: palletRackingImg, size: 'small' },
  { id: 'p6', image: shelvingAltImg, size: 'small' },
]
