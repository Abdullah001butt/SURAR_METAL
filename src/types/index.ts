import type { LucideIcon } from 'lucide-react'

export interface NavLink {
  labelKey: string
  href: string
  megaMenu?: MegaMenuColumn[]
}

export interface MegaMenuColumn {
  headingKey: string
  items: { labelKey: string; href: string; descriptionKey?: string }[]
}

export interface ProductCategory {
  id: string
  image: string
  href: string
}

export interface Industry {
  id: string
  icon: LucideIcon
}

export interface Statistic {
  id: string
  value: number
  suffix: string
}

export interface Project {
  id: string
  image: string
  size: 'small' | 'large'
}

export interface ProcessStep {
  id: string
  step: string
}

export interface Testimonial {
  id: string
  rating: number
}

export interface FaqItem {
  id: string
}

export interface QuoteFormValues {
  name: string
  company: string
  email: string
  phone: string
  productInterest: string
  message: string
}
