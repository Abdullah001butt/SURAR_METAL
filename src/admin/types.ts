export type DocType = 'quotation' | 'invoice' | 'tax_invoice' | 'delivery_note' | 'payment_receipt'
export type PaymentMethodType = 'cash' | 'cheque' | 'bank_transfer' | 'card'
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
  photo_url: string | null
  pdf_catalog_url: string | null
  specifications: string | null
  category: string | null
  moq: number
  created_at: string
}

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'

export interface ProjectDocument {
  name: string
  url: string
}

export interface Project {
  id: number
  name: string
  client_id: number | null
  status: ProjectStatus
  progress_pct: number
  budget: number
  deadline: string | null
  assigned_staff: string | null
  category: string | null
  photos: string[]
  documents: ProjectDocument[]
  created_at: string
  updated_at: string
  client?: Customer
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
  cost_price: number
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
  manual_total: number | null
  payment_method: PaymentMethodType | null
  reference_no: string | null
  bank_name: string | null
  converted_from_id: number | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: DocumentItem[]
}

export interface QuoteRequest {
  id: number
  name: string
  company: string | null
  email: string | null
  phone: string
  product_interest: string
  message: string | null
  status: LeadStatus
  notes: string | null
  source: string
  created_at: string
}

export interface AbandonedQuote {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  company: string | null
  product_interest: string | null
  message: string | null
  step_reached: string
  contacted: boolean
  notes: string | null
  created_at: string
  updated_at: string
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

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string | null
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface CompletionReportItem {
  id?: number
  report_id?: number
  sr_no: number
  lpo_no: string | null
  invoice_no: string | null
  item_date: string | null
  amount: number
}

export interface CompletionReport {
  id: number
  client_name: string
  client_location: string | null
  staff_name: string
  staff_email: string | null
  report_date: string
  subject: string
  intro_text: string
  work_details: string
  confirmation_text: string
  customer_id: number | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: CompletionReportItem[]
}

export type ExpenseCategory = 'rent' | 'salaries' | 'fuel' | 'utilities' | 'materials' | 'transport' | 'marketing' | 'other'
export type PaymentMethod = 'cash' | 'bank' | 'card' | 'cheque'
export type SupplierBillStatus = 'unpaid' | 'paid' | 'overdue'

export interface Expense {
  id: number
  category: ExpenseCategory
  description: string
  vendor: string | null
  amount: number
  vat_amount: number
  payment_method: PaymentMethod
  expense_date: string
  created_at: string
}

export type PersonalExpenseCategory = 'transport' | 'food' | 'subscriptions' | 'family' | 'income' | 'other'

export interface PersonalExpense {
  id: number
  expense_date: string
  description: string
  amount: number
  category: PersonalExpenseCategory
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SupplierBill {
  id: number
  supplier_name: string
  bill_number: string | null
  amount: number
  vat_amount: number
  bill_date: string
  due_date: string | null
  status: SupplierBillStatus
  paid_date: string | null
  notes: string | null
  created_at: string
}
