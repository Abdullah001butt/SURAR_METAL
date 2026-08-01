import { supabase } from '@/services/supabase'
import { exportMultiSheetBackup, type BackupSheet } from '@/admin/utils/excelExport'
import { calcTotals } from '@/admin/utils/documentCalc'
import type { AlSururDocument, Customer, Product, Project, BlogPost } from '@/admin/types'

export async function exportFullBackup() {
  const [customersRes, productsRes, documentsRes, projectsRes, quotesRes, contactsRes, blogRes] = await Promise.all([
    supabase.from('customers').select('*').order('name'),
    supabase.from('products').select('*').order('description'),
    supabase.from('documents').select('*, customer:customers(name), items:document_items(*)').order('created_at', { ascending: false }),
    supabase.from('projects').select('*, client:customers(name)').order('created_at', { ascending: false }),
    supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
  ])

  const customers = (customersRes.data ?? []) as Customer[]
  const products = (productsRes.data ?? []) as Product[]
  const documents = (documentsRes.data ?? []) as AlSururDocument[]
  const projects = (projectsRes.data ?? []) as (Project & { client?: Customer })[]
  const blogPosts = (blogRes.data ?? []) as BlogPost[]

  const sheets: BackupSheet<unknown>[] = [
    {
      title: 'Al Surur — Customers',
      sheetName: 'Customers',
      rows: customers,
      columns: [
        { header: 'Name', value: (r) => (r as Customer).name, width: 26 },
        { header: 'Phone', value: (r) => (r as Customer).phone ?? '—', width: 16 },
        { header: 'Address', value: (r) => (r as Customer).address ?? '—', width: 28 },
        { header: 'TRN', value: (r) => (r as Customer).trn_no ?? '—', width: 16 },
        { header: 'Added', value: (r) => new Date((r as Customer).created_at), width: 18 },
      ],
    },
    {
      title: 'Al Surur — Product Catalog',
      sheetName: 'Products',
      rows: products,
      columns: [
        { header: 'Code', value: (r) => (r as Product).item_code ?? '—', width: 14 },
        { header: 'Description', value: (r) => (r as Product).description, width: 30 },
        { header: 'Category', value: (r) => (r as Product).category ?? '—', width: 18 },
        { header: 'Price (AED)', value: (r) => (r as Product).default_unit_price, width: 14 },
        { header: 'MOQ', value: (r) => (r as Product).moq, width: 10 },
        { header: 'Stock', value: (r) => (r as Product).stock_qty, width: 10 },
      ],
    },
    {
      title: 'Al Surur — Documents',
      sheetName: 'Documents',
      rows: documents,
      columns: [
        { header: 'Number', value: (r) => (r as AlSururDocument).doc_number, width: 16 },
        { header: 'Type', value: (r) => (r as AlSururDocument).doc_type, width: 14 },
        { header: 'Customer', value: (r) => (r as AlSururDocument).customer?.name ?? '—', width: 26 },
        { header: 'Date', value: (r) => new Date((r as AlSururDocument).doc_date), width: 16 },
        {
          header: 'Total (AED)',
          value: (r) => {
            const doc = r as AlSururDocument
            return Number(calcTotals(doc.items ?? [], doc.discount, doc.vat_rate).net.toFixed(2))
          },
          width: 16,
        },
        { header: 'Status', value: (r) => (r as AlSururDocument).status, width: 12 },
      ],
    },
    {
      title: 'Al Surur — Projects',
      sheetName: 'Projects',
      rows: projects,
      columns: [
        { header: 'Name', value: (r) => (r as Project & { client?: Customer }).name, width: 28 },
        { header: 'Client', value: (r) => (r as Project & { client?: Customer }).client?.name ?? '—', width: 24 },
        { header: 'Status', value: (r) => (r as Project).status, width: 14 },
        { header: 'Progress %', value: (r) => (r as Project).progress_pct, width: 12 },
        { header: 'Budget (AED)', value: (r) => (r as Project).budget, width: 16 },
        { header: 'Deadline', value: (r) => ((r as Project).deadline ? new Date((r as Project).deadline!) : ''), width: 16 },
      ],
    },
    {
      title: 'Al Surur — Quote Requests',
      sheetName: 'Quote Requests',
      rows: quotesRes.data ?? [],
      columns: [
        { header: 'Name', value: (r) => (r as { name: string }).name, width: 22 },
        { header: 'Company', value: (r) => (r as { company: string | null }).company ?? '—', width: 22 },
        { header: 'Phone', value: (r) => (r as { phone: string }).phone, width: 16 },
        { header: 'Interest', value: (r) => (r as { product_interest: string }).product_interest, width: 22 },
        { header: 'Status', value: (r) => (r as { status: string }).status, width: 12 },
        { header: 'Received', value: (r) => new Date((r as { created_at: string }).created_at), width: 18 },
      ],
    },
    {
      title: 'Al Surur — Contact Messages',
      sheetName: 'Contact Messages',
      rows: contactsRes.data ?? [],
      columns: [
        { header: 'Name', value: (r) => (r as { name: string }).name, width: 22 },
        { header: 'Email', value: (r) => (r as { email: string | null }).email ?? '—', width: 26 },
        { header: 'Message', value: (r) => (r as { message: string }).message, width: 40 },
        { header: 'Status', value: (r) => (r as { status: string }).status, width: 12 },
        { header: 'Received', value: (r) => new Date((r as { created_at: string }).created_at), width: 18 },
      ],
    },
    {
      title: 'Al Surur — Blog Posts',
      sheetName: 'Blog',
      rows: blogPosts,
      columns: [
        { header: 'Title', value: (r) => (r as BlogPost).title, width: 34 },
        { header: 'Slug', value: (r) => (r as BlogPost).slug, width: 26 },
        { header: 'Published', value: (r) => ((r as BlogPost).published ? 'Yes' : 'Draft'), width: 12 },
        { header: 'Published At', value: (r) => ((r as BlogPost).published_at ? new Date((r as BlogPost).published_at!) : ''), width: 18 },
      ],
    },
  ]

  await exportMultiSheetBackup(sheets, `Al-Surur-Full-Backup-${new Date().toISOString().slice(0, 10)}`)
}
