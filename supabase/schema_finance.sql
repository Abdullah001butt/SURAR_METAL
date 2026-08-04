-- Finance module: expenses, supplier bills. Feeds a P&L / cash flow / VAT report
-- built on top of these plus the existing documents (sales) and document_items
-- (cost/margin) tables. Internal-only, authenticated access.

create table if not exists expenses (
  id bigint generated always as identity primary key,
  category text not null default 'other'
    check (category in ('rent', 'salaries', 'fuel', 'utilities', 'materials', 'transport', 'marketing', 'other')),
  description text not null,
  vendor text,
  amount numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  payment_method text not null default 'bank' check (payment_method in ('cash', 'bank', 'card', 'cheque')),
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists supplier_bills (
  id bigint generated always as identity primary key,
  supplier_name text not null,
  bill_number text,
  amount numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  bill_date date not null default current_date,
  due_date date,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid', 'overdue')),
  paid_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_date_idx on expenses(expense_date);
create index if not exists supplier_bills_status_idx on supplier_bills(status);
create index if not exists supplier_bills_due_date_idx on supplier_bills(due_date);

alter table expenses enable row level security;
alter table supplier_bills enable row level security;

create policy "Authenticated full access on expenses" on expenses
  for all to authenticated using (true) with check (true);
create policy "Authenticated full access on supplier_bills" on supplier_bills
  for all to authenticated using (true) with check (true);
