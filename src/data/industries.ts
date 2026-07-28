import { Warehouse, Store, Factory, HeartPulse, UtensilsCrossed, Car, Truck } from 'lucide-react'
import type { Industry } from '@/types'

export const industries: Industry[] = [
  { id: 'warehousing', icon: Warehouse },
  { id: 'retail', icon: Store },
  { id: 'manufacturing', icon: Factory },
  { id: 'healthcare', icon: HeartPulse },
  { id: 'food', icon: UtensilsCrossed },
  { id: 'automotive', icon: Car },
  { id: 'logistics', icon: Truck },
]
