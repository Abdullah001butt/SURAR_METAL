export type DocType = 'quotation' | 'invoice' | 'tax_invoice' | 'delivery_note'
export type DocStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'

export interface Customer {
  id: number
  name: string
  phone: string | null
  address: string | null
  state_country: string | null
  trn_no: string | null
  created_at: string
}

export interface Product {
  id: number
  item_code: string | null
  description: string
  unit: string
  default_unit_price: number
  stock_qty: number
  reorder_level: number
  created_at: string
}

export interface DocumentItem {
  id?: number
  document_id?: number
  sr_no: number
  item_code: string | null
  description: string
  weight: number | null
  qty: number
  unit: string
  unit_price: number
}

export interface AlSururDocument {
  id: number
  doc_number: string
  doc_type: DocType
  status: DocStatus
  customer_id: number | null
  doc_date: string
  payment_terms: string | null
  sales_consultant: string | null
  po_ref: string | null
  place_of_supply: string | null
  prepared_by: string | null
  approved_by: string | null
  delivery_note: string | null
  duration_note: string | null
  load_capacity: string | null
  validity_days: number | null
  discount: number
  vat_rate: number
  converted_from_id: number | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: DocumentItem[]
}

export interface QuoteRequest {
  id: number
  name: string
  company: string
  email: string
  phone: string
  product_interest: string
  message: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  status: LeadStatus
  notes: string | null
  created_at: string
}
