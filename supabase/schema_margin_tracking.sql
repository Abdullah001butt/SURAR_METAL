-- Cost price per line item, used to compute margin internally.
-- Never exposed on customer-facing PDFs — admin/reports only.
alter table document_items add column if not exists cost_price numeric(12, 2) not null default 0;
