-- Quick Capture support: allow leads to be logged with just name + phone
-- (e.g. from a phone call), without requiring email/company up front.
alter table quote_requests alter column email drop not null;
alter table quote_requests alter column company drop not null;
alter table quote_requests add column if not exists source text not null default 'website';

alter table contact_messages alter column email drop not null;
