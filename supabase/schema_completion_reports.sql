-- Work Completion Reports: a distinct internal document type (not a quotation/invoice
-- variant) matching the company's existing Word template — client/staff info, a short
-- narrative, and a table of completed LPO/invoice line items with an auto-totaled amount.

create table if not exists completion_reports (
  id bigint generated always as identity primary key,
  client_name text not null,
  client_location text,
  staff_name text not null default 'MOHD FABEZ',
  staff_email text default 'alsururfabez@gmail.com',
  report_date date not null default current_date,
  subject text not null default 'Work Completion Report.',
  intro_text text not null default 'This is to confirm that all assigned works under the below-mentioned invoices have been successfully completed as per the agreed scope, standards, and safety requirements.',
  work_details text not null default 'All tasks related to supply, installation, and execution have been fully carried out and inspected. The work has been completed to your satisfaction and the site has been handed over in good working condition.',
  confirmation_text text not null default 'We kindly request you to review and acknowledge the completion of work and process the pending payment at the earliest convenience.',
  customer_id bigint references customers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists completion_report_items (
  id bigint generated always as identity primary key,
  report_id bigint not null references completion_reports(id) on delete cascade,
  sr_no integer not null,
  lpo_no text,
  invoice_no text,
  item_date date,
  amount numeric(12,2) not null default 0
);

create index if not exists completion_report_items_report_id_idx on completion_report_items(report_id);
create index if not exists completion_reports_customer_id_idx on completion_reports(customer_id);

alter table completion_reports enable row level security;
alter table completion_report_items enable row level security;

create policy "Authenticated full access on completion_reports" on completion_reports
  for all to authenticated using (true) with check (true);
create policy "Authenticated full access on completion_report_items" on completion_report_items
  for all to authenticated using (true) with check (true);
